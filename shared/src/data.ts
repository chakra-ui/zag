import type { StepDetails } from "@zag-js/tour"
import type { HandlePosition } from "@zag-js/image-cropper"

import { countryList } from "./country-list"
export { paginationData } from "./pagination-data"

export const selectData = countryList.map((country) => ({
  label: `${country.name} (${country.code})`,
  value: country.code,
}))

export const accordionData = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]

export const avatarData = {
  full: [
    "https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png/revision/latest/top-crop/width/200/height/150?cb=20210223094656",
    "https://static.wikia.nocookie.net/naruto/images/2/27/Kakashi_Hatake.png/revision/latest/top-crop/width/200/height/150?cb=20170628120149",
    "https://static.wikia.nocookie.net/naruto/images/4/4a/Obito_Uchiha.png/revision/latest/top-crop/width/200/height/150?cb=20220223045744",
    "https://static.wikia.nocookie.net/naruto/images/e/e9/Itachi_Child_OL.png/revision/latest/top-crop/width/200/height/150?cb=20210415223303",
  ],
  broken:
    "https://broken.wikia.nocookie.net/naruto/images/e/e9/Itachi_ld_OL.png/revision/latest/top-crop/width/200/height/150?cb=20223303",
}

export const comboboxData = [
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA" },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "American Samoa", code: "AS" },
  { label: "Andorra", code: "AD" },
  { label: "Angola", code: "AO" },
  { label: "Anguilla", code: "AI" },
  { label: "Antarctica", code: "AQ" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Azerbaijan", code: "AZ" },
  { label: "Bahamas", code: "BS" },
  { label: "Bahrain", code: "BH" },
  { label: "Madagascar", code: "MG" },
  { label: "Malawi", code: "MW" },
  { label: "Malaysia", code: "MY" },
  { label: "Maldives", code: "MV" },
  { label: "Mali", code: "ML" },
  { label: "Malta", code: "MT" },
  { label: "Togo", code: "TG" },
  { label: "Tokelau", code: "TK" },
  { label: "Tonga", code: "TO" },
  { label: "Trinidad and Tobago", code: "TT" },
  { label: "Tunisia", code: "TN" },
]

export const tabsData = [
  {
    id: "nils",
    label: "Nils Frahm",
    content: `
    Nils Frahm is a German musician, composer and record producer based in Berlin. He is known for combining
            classical and electronic music and for an unconventional approach to the piano in which he mixes a grand
            piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and Moog Taurus.
    `,
  },
  {
    id: "agnes",
    label: "Agnes Obel",
    content: `
    Agnes Caroline Thaarup Obel is a Danish singer/songwriter. Her first album, Philharmonics, was released by
            PIAS Recordings on 4 October 2010 in Europe. Philharmonics was certified gold in June 2011 by the Belgian
            Entertainment Association (BEA) for sales of 10,000 Copies.
    `,
  },
  {
    id: "joke",
    label: "Joke",
    content: `
    Fear of complicated buildings: A complex complex complex.
    `,
  },
]

export const menuData = [
  [
    { label: "New File", value: "new-file" },
    { label: "New Tab", value: "new-tab" },
    { label: "New Window", value: "new-win" },
    { label: "More Tools →", value: "more-tools", trigger: true },
    { label: "Export", value: "export" },
    { label: "Go to Google...", value: "google" },
  ],
  [
    { label: "Save Page As...", value: "save-page" },
    { label: "Create Shortcuts", value: "shortcut" },
    { label: "Name Window...", value: "name-win" },
    { label: "Open nested →", value: "open-nested", trigger: true },
    { label: "Switch Window", value: "switch-win" },
    { label: "New Terminal", value: "new-term" },
  ],
  [
    { label: "Welcome", value: "welcome" },
    { label: "Playground", value: "playground" },
    { label: "Export", value: "export" },
  ],
]

export const menuOptionData = {
  order: [
    { label: "Ascending", value: "asc" },
    { label: "Descending", value: "desc" },
    { label: "None", value: "none" },
  ],
  type: [
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Address", value: "address" },
  ],
}

export const radioData = [
  { id: "apple", label: "Apples" },
  { id: "orange", label: "Oranges" },
  { id: "mango", label: "Mangoes" },
  { id: "grape", label: "Grapes" },
]

export const carouselData = [
  "https://picsum.photos/seed/a/500/300",
  "https://picsum.photos/seed/b/500/300",
  "https://picsum.photos/seed/c/500/300",
  "https://picsum.photos/seed/d/500/300",
  "https://picsum.photos/seed/e/500/300",
  "https://picsum.photos/seed/f/500/300",
]

export const toggleGroupData = [
  { value: "bold", label: "B" },
  { value: "italic", label: "I" },
  { value: "underline", label: "U" },
]

export const treeViewData = {
  name: "",
  children: [
    {
      name: "src",
      children: [{ name: "index.js" }, { name: "styles.css" }],
    },
    {
      name: "node_modules",
      children: [
        {
          name: "zag-js",
          children: [{ name: "treeview.mjs" }],
        },
        { name: "react", children: [{ name: "bundle.js" }] },
      ],
    },
    {
      name: ".npmignore",
    },
    {
      name: "package.json",
    },
    {
      name: "panda.config.ts",
    },
  ],
}

export const tourDataWithEffect: StepDetails[] = [
  {
    type: "floating",
    placement: "bottom-end",
    id: "step-0",
    title: "Step 1. Controls",
    description: "Use them to change the context properties",
    actions: [{ label: "Show me the tour", action: "next" }],
  },
  {
    type: "tooltip",
    id: "step-1",
    title: "Step 1. Controls",
    description: "Use them to change the context properties",
    target: () => document.querySelector<HTMLElement>(".toolbar nav button:nth-child(1)"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "wait",
    id: "step-xx",
    title: "Step xx",
    description: "Wait for 2 seconds",
    effect({ show, next }) {
      show()
      let timer = setTimeout(next, 5000)
      return () => clearTimeout(timer)
    },
  },
  {
    type: "tooltip",
    id: "step-2",
    title: "Step 2. Visualizer",
    description: "Use them to see the state of the tour. Click the Visualizer button to proceed.",
    target: () => document.querySelector<HTMLElement>(".toolbar nav button:nth-child(2)"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "tooltip",
    id: "step-4",
    title: "Step 4. Close",
    description: "Here's the context information",
    target: () => document.querySelector<HTMLElement>(".toolbar [data-content][data-active]"),
    placement: "left-start",
    actions: [{ label: "Finish", action: "dismiss" }],
  },
]

export const tourData: StepDetails[] = [
  {
    type: "dialog",
    id: "step-0",
    title: "Centered tour (no target)",
    description: "This is the center of the world. Ready to start the tour?",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    type: "tooltip",
    id: "step-1",
    title: "Step 1. Welcome",
    description: "To the new world",
    target: () => document.querySelector<HTMLElement>("#step-1"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
    effect({ show, update }) {
      const abort = new AbortController()

      fetch("https://api.github.com/users/octocat", { signal: abort.signal })
        .then((res) => res.json())
        .then((data) => {
          update({ title: data.name })
          show()
        })

      return () => {
        abort.abort("Network signal aborted")
      }
    },
  },
  {
    type: "tooltip",
    id: "step-2",
    title: "Step 2. Inside a scrollable container",
    description: "Using scrollIntoView(...) rocks!",
    target: () => document.querySelector<HTMLElement>("#step-2"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "tooltip",
    id: "step-2a",
    title: "Step 2a. Inside an Iframe container",
    description: "It calculates the offset rect correctly. Thanks to floating UI!",
    target: () => {
      const [frameEl] = Array.from(frames)
      return frameEl?.document.querySelector<HTMLElement>("#step-2a")
    },
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "tooltip",
    id: "step-3",
    title: "Step 3. Normal scrolling",
    description: "The new world is a great place",
    target: () => document.querySelector<HTMLElement>("#step-3"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "tooltip",
    id: "step-4",
    title: "Step 4. Close to bottom",
    description: "So nice to see the scrolling works!",
    target: () => document.querySelector<HTMLElement>("#step-4"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "dialog",
    id: "step-5",
    title: "You're all sorted! (no target)",
    description: "Thanks for trying out the tour. Enjoy the app!",
    actions: [{ label: "Finish", action: "dismiss" }],
  },
]

export const stepsData = [
  { value: "first", title: "First", description: "Contact Info" },
  { value: "second", title: "Second", description: "Date & Time" },
  { value: "third", title: "Third", description: "Select Rooms" },
]

export * as commandData from "./command"

// JSON Tree test data
const testArray = [1, 2, 3, 4, 5]
Object.defineProperties(testArray, {
  customProperty: { value: "custom value", enumerable: false, writable: false },
  anotherProperty: { value: 42, enumerable: false, writable: false },
})

const sparseArray = new Array(10)
sparseArray[9] = 9

class TestClass {
  name: string
  constructor() {
    this.name = "Test Class"
  }
}

export const jsonTreeData = {
  name: "John Doe",
  longString: "This is a long string that should be collapsed after 30 characters and show ellipsis",
  age: 30,
  email: "john.doe@example.com",
  tags: ["tag1", "tag2", "tag3"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zip: "12345",
  },
  testArray,
  sparseArray,
  map: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
  testClass: new TestClass(),
  elements: ["svelte", 123, false, true, null, undefined, 456n],
  functions: [
    function sum(a: number, b: number) {
      return a + b
    },
    async (promises: Promise<any>[]) => await Promise.all(promises),
    function* generator(a: number) {
      while (a--) {
        yield a
      }
    },
  ],
  set: new Set([1, 2, 3, 4, 5]),
  regex: /^[a-z0-9]+/g,
  case_insensitive: /^(?:[a-z0-9]+)foo.*?/i,
  date: new Date(2025, 6, 10),
  symbol: Symbol("test"),
  bigint: BigInt(123),
  null: null,
}

export const handlePositions: HandlePosition[] = [
  "top-left",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
]
