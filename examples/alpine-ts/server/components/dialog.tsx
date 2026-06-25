export function Dialog(props: any) {
  return (
    <div x-dialog="{id: $id('dialog')}" {...props}>
      <button x-dialog:trigger>Open Dialog</button>
      <template x-if="$dialog().open">
        <template x-teleport="body">
          <div x-dialog:backdrop />
          <div x-dialog:positioner>
            <div x-dialog:content>
              <h2 x-dialog:title>Edit profile</h2>
              <p x-dialog:description>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button x-dialog:closse-trigger>Close</button>
            </div>
          </div>
        </template>
      </template>
    </div>
  )
}
