interface ServerSideComponentProp<
    Params,
    SearchParams = undefined,
> {
    params: Params;
    searchParams: Partial<SearchParams>;
}

// Utility type to extract params from URL
type RouteParams<T> = T extends `${infer _Start}/[${infer Param}]${infer Rest}`
  ? { [key in Param | keyof RouteParams<Rest>]: string }
  : {};

type NextApiParams<Route extends string> = {
params: RouteParams<Route>;
};

/*
type Data = ReturnType<typeof GET> extends NextResponse<infer T> ? T : never; //AUTO INFER RETURN TYPE!!!
*/