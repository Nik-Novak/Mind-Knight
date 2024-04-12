interface ServerSideComponentProp<
    Params,
    SearchParams = undefined,
> {
    params: Params;
    searchParams: Partial<SearchParams>;
}