import { AnatomyInstance, AnatomyPartName } from "@zag-js/anatomy"
import { anatomy as sliderAnatomy } from "@zag-js/slider"

export const anatomy = sliderAnatomy as AnatomyInstance<AnatomyPartName<typeof sliderAnatomy>>
export const parts = anatomy.build()
