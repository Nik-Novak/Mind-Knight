import * as React from 'react';
import { EmotionCache } from '@emotion/react';
export interface EmotionCacheProviderProps {
    emotionCache?: EmotionCache;
}
export declare function AppCacheProvider({ emotionCache, children, }: React.PropsWithChildren<EmotionCacheProviderProps>): React.JSX.Element;
