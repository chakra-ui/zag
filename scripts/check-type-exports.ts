import { join } from "path"
import { ModuleResolutionKind, Project, SourceFile } from "ts-morph"
import { getMachinePackages } from "./get-packages"
import { pascalCase } from "scule"

interface CheckResult {
  machine: string
  issues: string[]
}

interface TypeExport {
  name: string
  alias: string | null
}

function getExportedTypes(sourceFile: SourceFile | undefined): string[] {
  if (!sourceFile) return []

  const types = new Set<string>()

  const exportDeclarations = sourceFile.getExportDeclarations()

  for (const exportDecl of exportDeclarations) {
    const namedExports = exportDecl.getNamedExports()

    // Get named exports: export type { Foo, Bar } from "module"
    if (namedExports.length > 0) {
      for (const namedExport of namedExports) {
        const name = namedExport.getName()
        types.add(name)
      }
    }
  }

  // Get exported type aliases: export type Foo = ...
  const typeAliases = sourceFile.getTypeAliases()
  for (const typeAlias of typeAliases) {
    if (typeAlias.isExported()) {
      types.add(typeAlias.getName())
    }
  }

  // Get exported interfaces: export interface Foo { ... }
  const interfaces = sourceFile.getInterfaces()
  for (const iface of interfaces) {
    if (iface.isExported()) {
      types.add(iface.getName())
    }
  }

  // Get exported enums: export enum Foo { ... }
  const enums = sourceFile.getEnums()
  for (const enumDecl of enums) {
    if (enumDecl.isExported()) {
      types.add(enumDecl.getName())
    }
  }

  return Array.from(types)
}

function getIndexTypeExports(sourceFile: SourceFile | undefined): TypeExport[] {
  if (!sourceFile) return []

  const exports: TypeExport[] = []
  const exportDeclarations = sourceFile.getExportDeclarations()

  for (const exportDecl of exportDeclarations) {
    // Check if it's exporting from .types file
    const moduleSpecifier = exportDecl.getModuleSpecifierValue()
    if (!moduleSpecifier?.includes(".types")) continue

    // Must be type-only export
    if (!exportDecl.isTypeOnly()) continue

    const namedExports = exportDecl.getNamedExports()

    for (const namedExport of namedExports) {
      const name = namedExport.getName()
      const aliasNode = namedExport.getAliasNode()
      const alias = aliasNode ? aliasNode.getText() : null

      exports.push({ name, alias })
    }
  }

  return exports
}

function checkMachine(project: Project, machineDir: string, machineName: string): CheckResult {
  const pascalName = pascalCase(machineName)
  const schemaType = `${pascalName}Schema`
  const issues: string[] = []

  const typesFilePath = join(machineDir, "src", `${machineName}.types.ts`)
  const indexPath = join(machineDir, "src", "index.ts")

  try {
    const typesFile = project.getSourceFile(typesFilePath)
    const indexFile = project.getSourceFile(indexPath)

    const allTypes = getExportedTypes(typesFile)
    const indexExports = getIndexTypeExports(indexFile)

    const indexExportsMap = new Map<string, string | null>()
    for (const exp of indexExports) {
      indexExportsMap.set(exp.name, exp.alias)
    }

    // Check 1: Schema should NOT be exported
    if (indexExportsMap.has(schemaType)) {
      issues.push(`❌ ${schemaType} should NOT be exported`)
    }

    // Check 2: Required aliased exports
    const requiredAliases: Record<string, string> = {
      [`${pascalName}Api`]: "Api",
      [`${pascalName}Machine`]: "Machine",
      [`${pascalName}Props`]: "Props",
      [`${pascalName}Service`]: "Service",
    }

    for (const [fullName, expectedAlias] of Object.entries(requiredAliases)) {
      // Skip if type doesn't exist in types file
      if (!allTypes.includes(fullName)) continue

      const actualAlias = indexExportsMap.get(fullName)

      if (actualAlias === undefined) {
        issues.push(`❌ Missing export: ${fullName} as ${expectedAlias}`)
      } else if (actualAlias !== expectedAlias) {
        if (actualAlias === null) {
          issues.push(`❌ ${fullName} should be aliased as ${expectedAlias}`)
        } else {
          issues.push(`❌ ${fullName} has wrong alias "${actualAlias}", should be "${expectedAlias}"`)
        }
      }
    }

    // Check 3: All types (except Schema) should be exported
    const expectedTypes = allTypes.filter((type) => type !== schemaType)
    const exportedTypeNames = Array.from(indexExportsMap.keys())

    for (const type of expectedTypes) {
      if (!exportedTypeNames.includes(type)) {
        issues.push(`❌ Missing export: ${type}`)
      }
    }

    // Check 4: No unexpected exports
    for (const exportedType of exportedTypeNames) {
      if (!allTypes.includes(exportedType)) {
        issues.push(`⚠️  Exporting type "${exportedType}" that doesn't exist in ${machineName}.types.ts`)
      }
    }
  } catch (error) {
    issues.push(`❌ Error reading files: ${error}`)
  }

  return { machine: machineName, issues }
}

async function main() {
  console.log("Checking type exports for all machines...")

  const project = new Project({
    compilerOptions: {
      moduleResolution: ModuleResolutionKind.NodeNext,
    },
  })

  const machines = await getMachinePackages()

  for (const { dir } of machines) {
    const glob = `${dir}/src/**/*.ts`
    project.addSourceFilesAtPaths(glob)
  }

  const results: CheckResult[] = []
  let totalIssues = 0

  for (const { dir } of machines) {
    const machineName = dir.split("/").pop()!
    const result = checkMachine(project, dir, machineName)

    if (result.issues.length > 0) {
      results.push(result)
      totalIssues += result.issues.length
    }
  }

  if (results.length === 0) {
    console.log(`All ${machines.length} machines have correct type exports! ✨`)
  } else {
    console.warn(`Found issues in ${results.length} machine(s):\n`)

    for (const { machine, issues } of results) {
      console.log(`\n📦 ${machine}:`)
      for (const issue of issues) {
        console.log(`  ${issue}`)
      }
    }

    console.log(`\n`)
    console.error(`Total: ${totalIssues} issue(s) found`)
  }
}

main().catch(console.error)
