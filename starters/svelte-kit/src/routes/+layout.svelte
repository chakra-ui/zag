<script>
  import { page } from "$app/stores"
</script>

<nav style="display: flex; gap: 16px; padding: 16px; background: #f0f0f0;">
  <a href="/switch" style="color: {$page.url.pathname === '/switch' ? 'blue' : 'black'}">
    Switch Page
  </a>
  <a href="/settings" style="color: {$page.url.pathname === '/settings' ? 'blue' : 'black'}">
    Settings Page
  </a>
</nav>

<main style="padding: 16px;">
  <slot />
</main>
