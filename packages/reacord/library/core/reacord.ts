import type { ReactNode } from "react"
import type { ComponentInteraction } from "../internal/interaction"
import { reconciler } from "../internal/reconciler.js"
import type { Renderer } from "../internal/renderers/renderer"
import type { ReacordInstance } from "./instance"

/**
 * @category Core
 */
export type ReacordConfig = {
  /**
   * The max number of active instances.
   * When this limit is exceeded, the oldest instances will be disabled.
   */
  maxInstances?: number
}

/**
 * The main Reacord class that other Reacord adapters should extend.
 * Only use this directly if you're making [a custom adapter](/guides/custom-adapters).
 */
export abstract class Reacord {
  private renderers: Renderer[] = []

  constructor(private readonly config: ReacordConfig = {}) {}

  abstract send(...args: unknown[]): ReacordInstance
  abstract reply(...args: unknown[]): ReacordInstance
  abstract ephemeralReply(...args: unknown[]): ReacordInstance

  protected handleComponentInteraction(interaction: ComponentInteraction) {
    for (const renderer of this.renderers) {
      if (renderer.handleComponentInteraction(interaction)) return
    }
  }

  private get maxInstances() {
    return this.config.maxInstances ?? 50
  }

  protected createInstance(renderer: Renderer, initialContent?: ReactNode) {
    if (this.renderers.length > this.maxInstances) {
      this.deactivate(this.renderers[0]!)
    }

    this.renderers.push(renderer)

    const container = reconciler.createContainer(renderer, 0, false, {})

    if (initialContent !== undefined) {
      reconciler.updateContainer(initialContent, container)
    }

    return {
      render: (content: ReactNode) => {
        reconciler.updateContainer(content, container)
      },
      deactivate: () => {
        this.deactivate(renderer)
      },
      destroy: () => {
        this.renderers = this.renderers.filter((it) => it !== renderer)
        renderer.destroy()
      },
    }
  }

  private deactivate(renderer: Renderer) {
    this.renderers = this.renderers.filter((it) => it !== renderer)
    renderer.deactivate()
  }
}
