---
"@zag-js/dismissable": patch
---

- Fix opening a popover or menu while another one is open closing both, most noticeably on touch. A layer now only closes the layers opened from inside it.
