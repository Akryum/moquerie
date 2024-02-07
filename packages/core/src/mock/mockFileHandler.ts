export interface MockFileItem {
  file: string
}

export class MockFileHandler<TItem extends MockFileItem> {
  key: string
  items: TItem[] = []
  changeHandlers: Array<() => unknown> = []

  constructor(key: string) {
    this.key = key
  }

  handleMockFile(file: string, data: any) {
    // Cleanup
    this.removeMany(file)

    if (data[this.key]) {
      this.add(file, data[this.key])
      this.notifyChange()
    }
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  add(file: string, data: any) {
    // @TODO: Implement
  }

  handleMockFileRemoved(file: string) {
    this.removeMany(file)
    this.notifyChange()
  }

  removeMany(file: string) {
    this.items = this.items.filter(item => item.file !== file)
  }

  onChange(handler: () => unknown) {
    this.changeHandlers.push(handler)
  }

  destroy() {
    this.items.length = 0
  }

  private notifyChange() {
    for (const handler of this.changeHandlers) {
      handler()
    }
  }
}
