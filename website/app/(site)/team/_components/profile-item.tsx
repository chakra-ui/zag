import type { TeamMember } from "lib/community"
import { FaDiscord, FaGithub, FaXTwitter, FaYoutube } from "react-icons/fa6"
import { team } from "styled-system/recipes"

function getHandle(href: string) {
  try {
    const handle = new URL(href).pathname.replace(/^\/+/, "").split("/")[0]
    return handle ? `@${handle}` : href
  } catch {
    return href
  }
}

function getAvatar(member: TeamMember) {
  if (member.avatar) return member.avatar
  const github = member.links?.find((link) => link.label === "GitHub")
  if (github)
    return `https://github.com/${getHandle(github.href).slice(1)}.png?size=112`
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=112`
}

function PlatformIcon({ label }: { label: string }) {
  const name = label.toLowerCase()
  if (name.includes("github")) return <FaGithub aria-hidden />
  if (name === "x" || name.includes("twitter"))
    return <FaXTwitter aria-hidden />
  if (name.includes("youtube")) return <FaYoutube aria-hidden />
  if (name.includes("discord")) return <FaDiscord aria-hidden />
  return null
}

export function ProfileItem({ member }: { member: TeamMember }) {
  const styles = team()
  const links =
    member.links ??
    (member.href ? [{ label: "GitHub", href: member.href }] : [])
  return (
    <div className={styles.member}>
      <img
        src={getAvatar(member)}
        alt=""
        width={56}
        height={56}
        className={styles.avatar}
      />
      <div>
        <h3 className={styles.name}>{member.name}</h3>
        <p className={styles.role}>{member.role}</p>
      </div>
      {links.length > 0 && (
        <div className={styles.links}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on ${link.label}`}
              className={styles.link}
            >
              <PlatformIcon label={link.label} />
              {getHandle(link.href)}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
