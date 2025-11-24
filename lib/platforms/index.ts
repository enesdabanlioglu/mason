import { IPlatformAdapter } from '@/types/platform'
import { GoogleContactsAdapter } from './google/GoogleContactsAdapter'

export class PlatformFactory {
  static getAdapter(platform: string): IPlatformAdapter {
    switch (platform) {
      case 'google':
        return new GoogleContactsAdapter()
      default:
        throw new Error(`Platform ${platform} not supported`)
    }
  }
}


