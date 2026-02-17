declare module 'react-cytoscapejs' {
  import { Core, ElementDefinition, Stylesheet } from 'cytoscape'
  import { Component, CSSProperties } from 'react'

  export interface CytoscapeComponentProps {
    id?: string
    cy?: (cy: Core) => void
    style?: CSSProperties
    elements: ElementDefinition[]
    layout?: cytoscape.LayoutOptions
    stylesheet?: Stylesheet[]
    className?: string
    zoom?: number
    pan?: { x: number; y: number }
    minZoom?: number
    maxZoom?: number
    zoomingEnabled?: boolean
    userZoomingEnabled?: boolean
    panningEnabled?: boolean
    userPanningEnabled?: boolean
    boxSelectionEnabled?: boolean
    autoungrabify?: boolean
    autounselectify?: boolean
    wheelSensitivity?: number
    autolock?: boolean
    get?: (name: string) => unknown
    toJson?: () => unknown
    headless?: boolean
    styleEnabled?: boolean
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {
    static normalizeElements(
      data: { nodes?: unknown[]; edges?: unknown[] } | unknown[]
    ): ElementDefinition[]
  }
}
