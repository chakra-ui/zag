import { getData } from "country-list"

export { paginationData } from "./pagination-data"

export const selectData = getData().map((country) => ({
  label: `${country.name} (${country.code})`,
  value: country.code,
}))

export const accordionData = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
]

export const comboboxData = [
  { label: "Zambia", code: "ZA" },
  { label: "Benin", code: "BN" },
  { label: "Canada", code: "CA", disabled: true },
  { label: "United States", code: "US" },
  { label: "Japan", code: "JP" },
  { label: "Nigeria", code: "NG" },
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "American Samoa", code: "AS" },
  { label: "AndorrA", code: "AD" },
  { label: "Angola", code: "AO" },
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
    { label: "New File", id: "new-file" },
    { label: "New Tab", id: "new-tab" },
    { label: "New Window", id: "new-win" },
    { label: "More Tools →", id: "more-tools", trigger: true },
    { label: "Export", id: "export" },
    { label: "Go to Google...", id: "google" },
  ],
  [
    { label: "Save Page As...", id: "save-page" },
    { label: "Create Shortcuts", id: "shortcut" },
    { label: "Name Window...", id: "name-win" },
    { label: "Open nested →", id: "open-nested", trigger: true },
    { label: "Switch Window", id: "switch-win" },
    { label: "New Terminal", id: "new-term" },
  ],
  [
    { label: "Welcome", id: "welcome" },
    { label: "Playground", id: "playground" },
    { label: "Export", id: "export" },
  ],
]

export const menuOptionData = {
  order: [
    { label: "Ascending", id: "asc" },
    { label: "Descending", id: "desc" },
    { label: "None", id: "none" },
  ],
  type: [
    { label: "Email", id: "email" },
    { label: "Phone", id: "phone" },
    { label: "Address", id: "address" },
  ],
}

export const radioData = [
  { id: "apple", label: "Apples" },
  { id: "orange", label: "Oranges" },
  { id: "mango", label: "Mangoes" },
  { id: "grape", label: "Grapes" },
]

export const datePickerData = {}
