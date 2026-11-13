"use client"

import * as menu from "@zag-js/menu"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useSearchParams } from "next/navigation"
import { createContext, Suspense, useContext, useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { Presence } from "@/components/presence"
import "@styles/popover.css"
import "@styles/menu.css"

interface Env {
  portal: boolean
  lazy: boolean
  getRootNode?: () => ShadowRoot | Document
  container?: HTMLElement
}

const EnvContext = createContext<Env>({ portal: true, lazy: true })

function MaybePortal({ children }: { children: React.ReactNode }) {
  const env = useContext(EnvContext)
  if (!env.portal) return <>{children}</>
  return (
    <Portal container={env.container ? { current: env.container } : undefined} getRootNode={env.getRootNode}>
      {children}
    </Portal>
  )
}

function Pop({ name, children }: { name: string; children?: React.ReactNode }) {
  const env = useContext(EnvContext)
  const service = useMachine(popover.machine, { id: useId(), getRootNode: env.getRootNode })
  const api = popover.connect(service, normalizeProps)
  return (
    <>
      <button data-testid={`${name}-trigger`} {...api.getTriggerProps()}>
        {name}
      </button>
      <MaybePortal>
        <div {...api.getPositionerProps()}>
          <Presence lazyMount={env.lazy} data-testid={`${name}-content`} {...api.getContentProps()}>
            <span>{name} content</span>
            {children}
          </Presence>
        </div>
      </MaybePortal>
    </>
  )
}

function Menu({ name }: { name: string }) {
  const env = useContext(EnvContext)
  const service = useMachine(menu.machine, { id: useId(), getRootNode: env.getRootNode })
  const api = menu.connect(service, normalizeProps)
  return (
    <>
      <button data-testid={`${name}-trigger`} {...api.getTriggerProps()}>
        {name}
      </button>
      <MaybePortal>
        <div {...api.getPositionerProps()}>
          <Presence lazyMount={env.lazy} data-testid={`${name}-content`} {...api.getContentProps()}>
            <div {...api.getItemProps({ value: "a" })}>Item A</div>
            <div {...api.getItemProps({ value: "b" })}>Item B</div>
          </Presence>
        </div>
      </MaybePortal>
    </>
  )
}

function Demo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 16 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <Pop name="a" />
        <Pop name="b" />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <Menu name="menu-a" />
        <Menu name="menu-b" />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <Pop name="parent">
          <Pop name="child" />
        </Pop>
        <Pop name="outsider" />
      </div>
      <div data-testid="blank" style={{ height: 200 }} />
    </div>
  )
}

function ShadowHost({ env, children }: { env: Env; children: React.ReactNode; height?: number }) {
  const [root, setRoot] = useState<ShadowRoot | null>(null)
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (host && !root) setRoot(host.shadowRoot ?? host.attachShadow({ mode: "open" }))
  }, [host, root])
  return (
    <div ref={setHost} data-testid="shadow-host">
      {root &&
        createPortal(
          <EnvContext.Provider value={{ ...env, getRootNode: () => root, container: root as unknown as HTMLElement }}>
            {children}
          </EnvContext.Provider>,
          root,
        )}
    </div>
  )
}

function FrameHost({ env, children, height = 700 }: { env: Env; children: React.ReactNode; height?: number }) {
  const [frame, setFrame] = useState<HTMLIFrameElement | null>(null)
  const [doc, setDoc] = useState<Document | null>(null)
  useEffect(() => {
    if (frame?.contentDocument?.readyState === "complete") setDoc(frame.contentDocument)
    else frame?.addEventListener("load", () => setDoc(frame.contentDocument), { once: true })
  }, [frame])
  return (
    <iframe ref={setFrame} title="frame" style={{ width: "100%", height, border: 0 }}>
      {doc &&
        createPortal(
          <EnvContext.Provider value={{ ...env, getRootNode: () => doc, container: doc.body }}>
            {children}
          </EnvContext.Provider>,
          doc.body,
        )}
    </iframe>
  )
}

function Mixed({ env, kind }: { env: Env; kind: "shadow" | "iframe" }) {
  const Host = kind === "shadow" ? ShadowHost : FrameHost
  return (
    <EnvContext.Provider value={env}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Pop name="outer" />
          <div style={{ width: 300 }}>
            <Host env={env} height={250}>
              <Pop name="inner" />
            </Host>
          </div>
        </div>
        <Pop name="wrap">
          <div style={{ width: 300 }}>
            <Host env={env} height={250}>
              <Pop name="deep" />
            </Host>
          </div>
        </Pop>
        <div data-testid="blank" style={{ height: 400 }} />
      </div>
    </EnvContext.Provider>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SiblingsPage />
    </Suspense>
  )
}

function SiblingsPage() {
  const query = useSearchParams()
  const env: Env = { portal: query.get("portal") !== "false", lazy: query.get("lazy") !== "false" }
  const where = query.get("env") ?? "document"
  return (
    <main data-env={where}>
      {where === "shadow" ? (
        <ShadowHost env={env}>
          <Demo />
        </ShadowHost>
      ) : where === "iframe" ? (
        <FrameHost env={env}>
          <Demo />
        </FrameHost>
      ) : where === "mixed-shadow" || where === "mixed-iframe" ? (
        <Mixed env={env} kind={where === "mixed-shadow" ? "shadow" : "iframe"} />
      ) : (
        <EnvContext.Provider value={env}>
          <Demo />
        </EnvContext.Provider>
      )}
    </main>
  )
}
