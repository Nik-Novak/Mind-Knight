import * as React from 'react';
import { AppType } from 'next/app';
import { EmotionCache } from '@emotion/react';
import { DocumentContext, DocumentInitialProps } from 'next/document';
interface Plugin {
    enhanceApp: (App: React.ComponentType<React.ComponentProps<AppType>>) => (props: any) => JSX.Element;
    resolveProps: (initialProps: DocumentInitialProps) => Promise<DocumentInitialProps>;
}
/**
 * A utility to compose multiple `getInitialProps` functions.
 */
export declare function createGetInitialProps(plugins: Plugin[]): (ctx: DocumentContext) => Promise<DocumentInitialProps>;
export interface DocumentHeadTagsProps {
    emotionStyleTags: React.ReactElement[];
}
export declare function DocumentHeadTags(props: DocumentHeadTagsProps): React.JSX.Element;
export declare function documentGetInitialProps(ctx: DocumentContext, options?: {
    emotionCache?: EmotionCache;
    plugins?: Plugin[];
}): Promise<import("next/dist/shared/lib/utils").RenderPageResult & {
    styles?: React.ReactFragment | JSX.Element | React.ReactElement<any, string | React.JSXElementConstructor<any>>[] | undefined;
} & DocumentHeadTagsProps>;
export {};
