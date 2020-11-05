import { InjectionToken } from 'injection-js';
import { Transform } from '../../brocc/transform';
import { TransformProvider, provideTransform } from '../../brocc/transform.di';
import { writeBundlesTransform } from './write-bundles.transform';
/** ENTRY_POINT_TRANSFORM_TOKEN 调用 */
export const WRITE_BUNDLES_TRANSFORM_TOKEN = new InjectionToken<Transform>(`ng.v5.writeBundlesTransform`);

export const WRITE_BUNDLES_TRANSFORM: TransformProvider = provideTransform({
  provide: WRITE_BUNDLES_TRANSFORM_TOKEN,
  useFactory: () => writeBundlesTransform,
});
