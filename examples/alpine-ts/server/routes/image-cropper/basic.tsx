import { handlePositions, imageCropperControls } from "@zag-js/shared"
import { defineHandler } from "nitro/h3"
import { Controls } from "../../components/controls"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/image-cropper.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data:controls="imageCropper"
          x-data="{
            zoom: 1,
            rotation: 0,
            flip: { horizontal: false, vertical: false },
            selectedHandle: 'e',
            resizeStep: 10,
            croppedImageUrl: null,
            isExporting: false,
            applyResize(direction) {
              const multiplier = direction === 'grow' ? 1 : -1;
              const amount = this.resizeStep * multiplier;
              $imageCropper().resize(this.selectedHandle, amount);
            },
            handleExportImage: async (output) => {
              this.isExporting = true;
              try {
                const result = await $imageCropper().getCroppedImage({ output });
                if (result) {
                  if (output === 'dataUrl') {
                    this.croppedImageUrl = result;
                  } else {
                    const blob = result;
                    const url = URL.createObjectURL(blob);
                    this.croppedImageUrl = url;
                  }
                }
              } catch (error) {
                console.error('Failed to export image:', error);
              } finally {
                this.isExporting = false;
              }
            },
            handleDownloadImage: async () => {
              this.isExporting = true
              try {
                const blob = await $imageCropper().getCroppedImage({ type: 'image/png' });
                if (blob && blob instanceof Blob) {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `cropped-image-${Date.now()}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  URL.revokeObjectURL(url)
                }
              } catch (error) {
                console.error('Failed to download image:', error)
              } finally {
                this.isExporting = false
              }
            }
          }"
          x-image-cropper="{
            id: $id('image-cropper'),
            zoom,
            onZoomChange(details) {
              zoom = details.zoom
            },
            rotation,
            onRotationChange(details) {
              rotation = details.rotation
            },
            flip,
            onFlipChange(details) {
              flip = details.flip
            },
            ...context,
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main class="image-cropper">
            <div x-image-cropper:root>
              <div x-image-cropper:viewport>
                <img src="https://picsum.photos/seed/a/500/300" crossOrigin="anonymous" x-image-cropper:image />
                <div x-image-cropper:selection>
                  {handlePositions.map((position) => (
                    <div x-image-cropper:handle={`{position: '${position}'}`}>
                      <div />
                    </div>
                  ))}
                  <div x-image-croppeer:grid="{axis: 'horizontal'}" />
                  <div x-image-croppeer:grid="{axis: 'vertical'}" />
                </div>
              </div>
            </div>
            <label>
              Zoom:
              <input
                type="range"
                x-bind:min="_x_image_cropper_service.prop('minZoom')"
                x-bind:max="_x_image_cropper_service.prop('maxZoom')"
                x-bind:step="_x_image_cropper_service.prop('zoomStep')"
                {...{ "x-model.number": "zoom" }}
                data-testid="zoom-slider"
              />
            </label>
            <label>
              Rotation:
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                {...{ "x-model.number": "rotation" }}
                data-testid="rotation-slider"
              />
            </label>
            <fieldset>
              <legend>Flip</legend>
              <label>
                <input type="checkbox" x-model="flip.horizontal" />
                Horizontal
              </label>
              <label>
                <input type="checkbox" x-model="flip.vertical" />
                Vertical
              </label>
              <div>
                <button type="button" x-on:click="$imageCropper().flipHorizontally()">
                  Toggle horizontal flip
                </button>
                <button type="button" x-on:click="$imageCropper().flipVertically()">
                  Toggle vertical flip
                </button>
                <button type="button" x-on:click="$imageCropper().setFlip({ horizontal: false, vertical: false })">
                  Reset flips
                </button>
              </div>
            </fieldset>
            <div>
              <label>
                Resize handle:
                <select data-testid="resize-handle-select" x-model="selectedHandle">
                  {handlePositions.map((position) => (
                    <option value={position}>{position}</option>
                  ))}
                </select>
              </label>
              <label>
                Resize step (px):
                <input data-testid="resize-step-input" type="number" min={1} x-model="resizeStep" />
              </label>
              <div>
                <button type="button" data-testid="grow-button" x-on:click="applyResize('grow')">
                  Grow selection
                </button>
                <button type="button" data-testid="shrink-button" x-on:click="applyResize('shrink')">
                  Shrink selection
                </button>
              </div>
            </div>

            <div>
              <button type="button" data-testid="reset-button" x-on:click="$imageCropper().reset()">
                Reset
              </button>
            </div>

            <fieldset>
              <legend>Export Cropped Image</legend>
              <div>
                <button
                  type="button"
                  x-on:click="handleExportImage('blob')"
                  x-bind:disabled="isExporting"
                  x-text="isExporting ? 'Exporting...' : 'Export as Blob'"
                ></button>
                <button
                  type="button"
                  x-on:click="handleExportImage('dataUrl')"
                  x-bind:disabled="isExporting"
                  x-text="isExporting ? 'Exporting...' : 'Export as Data URL'"
                ></button>
                <button
                  type="button"
                  x-on:click="handleDownloadImage"
                  x-bind:disabled="isExporting"
                  x-text="isExporting ? 'Downloading' : 'Download PNG'"
                ></button>
                <template x-if="croppedImageUrl">
                  <button
                    type="button"
                    x-in:click="() => {
                      if (croppedImageUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(croppedImageUrl)
                      }
                      setCroppedImageUrl(null)
                    }"
                  >
                    Clear Preview
                  </button>
                </template>
              </div>
              <template x-if="croppedImageUrl">
                <div>
                  <h3>Cropped Image Preview:</h3>
                  <img
                    x-bind:src="croppedImageUrl"
                    alt="Cropped result"
                    style={{ maxWidth: "100%", border: "1px solid #ccc" }}
                  />
                </div>
              </template>
            </fieldset>
          </main>

          <Toolbar>
            <Controls config={imageCropperControls} slot="controls" />
            <StateVisualizer
              label="image-cropper"
              context={["naturalSize", "crop", "zoom", "rotation", "flip", "offset"]}
            />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})
