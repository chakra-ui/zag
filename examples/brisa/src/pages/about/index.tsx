export function Head() {
  return <title id="title">About Brisa</title>
}

export default function About() {
  return (
    <>
      <div class="hero">
        <h1>
          <span class="h1_addition">About </span>Brisa
        </h1>
        <p class="edit-note">✏️ Change this page on </p>
        <code>src/pages/about/index.tsx</code>
      </div>
      <div class="about-sections">
        <section>
          <h2>Curious for more details? Let's dive in!</h2>

          <p>
            Brisa is the Web Platform Framework. Its pages are dynamically server-rendered JSX components, so there's
            zero JavaScript shipped to the browser by default.
          </p>

          <p>
            Everything runs exclusively on the server by default, except the Web Components folder which, of course,
            also runs on the client.
          </p>

          <p>
            We have solved the burden of writing and processing Web Components. Easy to write with Signals, Server-Side
            rendering, and optimized in build time to be fast and small; if you use Web Components, it adds +3KB.
          </p>

          <p>
            You can also use the Brisa compiler to create libraries of Web Components that work in any framework- or
            even without a framework, and they are supported by Server-Side rendering.
          </p>

          <p>
            We have also solved the Server Actions. With Brisa, the server components can capture any browser event:
            onSubmit, onInput, onFocus, onClick, and, all events from Web Components, like onClickOnMyComponent. These
            are all Server-Actions now, so you don't need to put "use client" nor "use server" any more. On the server
            they are simply Server-Actions, and on the client they are simply browser-events.
          </p>

          <p>
            To make this possible we have improved the communication between both worlds, creating new concepts like
            "Action Signals". With these, the server can react to Web Components without the need for rerenders. We have
            also added ideas from HTMX; you have extra attributes in the HTML for debouncing or managing errors and
            pending states.
          </p>

          <p>Brisa not only uses Hypermedia, it streams it over the wire.</p>

          <p>
            Brisa is also the only framework with full Internationalization support. not only routing, but you can also
            translate your pages and the URL pathnames if you need it. If you use i18n, the server components are 0
            Bytes, but in Web Components are 800 B. At the end we use the Web Platform; we make a bridge with the
            ECMAScript Intl API to make it easier for you to translate your Web Components.
          </p>

          <p>
            In Brisa we like the idea that all the tooling is integrated, that's why Brisa is made with Bun we have
            extended the Matchers and added an API so you can run with Bun the tests of your Components.
          </p>

          <p>
            Bun is great and improves the development experience a lot. Although we recommend Bun.js also as runtime, as
            output you can use Node.js if you want, generate a static output and upload it to a CDN, or generate an
            executable app for Android (.apk),  iOS (.ipa),  Windows (.exe), Mac (.dmg), or Linux (.deb). Yes, Brisa is
            multiplatform thanks to its integration with Tauri.
          </p>

          <p>We support Partial Prerendering, you can prerender only a part of your page, such as the footer.</p>

          <p>We also support many more features like middleware, layouts, WebSockets, API routes, suspense, etc.</p>

          <p>
            Brisa is the future of the Web, and the future is now. We invite you to try it and contribute to the
            community.
          </p>

          <p class="CTA-text">
            Ready to start?{" "}
            <a class="CTA" href="https://brisa.build" target="_blank" data-replace="Read the docs" rel="noreferrer">
              <span>Read the docs</span>
            </a>
          </p>
        </section>
      </div>
    </>
  )
}
