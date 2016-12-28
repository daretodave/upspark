import KEY_UNSORTED = ElementStateQuery.KEY_UNSORTED;
import ElementResolver = ElementStateQuery.ElementResolver;
import ResolvableElement = ElementStateQuery.ResolvableElement;
import ResolvableElementCollections = ElementStateQuery.ResolvableElementCollections;

export class ElementStateQuery {

    private elements = new Map<string, ElementReference[]>();

    constructor(private cache: boolean = true,
                elements: Map<string, ElementReference[]>) {

        if(elements !== null) {
            if(elements instanceof Map) {
                this.elements = elements;
            } else if(Array.isArray(elements)) {
                this.elements.set(KEY_UNSORTED, elements);
            }
        }
    }

    public query(...predicate: ElementState[]): Promise<ElementStateQueryResult> {
        return Promise
        .all(ElementResolution
            .fromGroupMap(
                this.elements,
                this.cache
            )
        )
        .then((result:ElementResolution[]) => {

            let groups:string[] = [],
                index:number = -1,
                group:string = null,
                first:HTMLElement = null,
                last:HTMLElement = null;

            result = result.filter((resolution:ElementResolution) => {
                let fail:boolean = false;

                predicate.forEach((test:ElementState) => {
                    if (fail) {
                        return;
                    }
                    if(!test(resolution)) {
                        fail = true;
                    }
                });

                return !fail;
            });

            result.forEach((resolution:ElementResolution) => {
                if(first === null) {
                    first = resolution.element;
                    index = resolution.index;
                    group = resolution.group;
                }

                last = resolution.element;

                if(resolution.group && !groups.includes(resolution.group)) {
                    groups.push(resolution.group);
                }
            });

            return {
                group,
                groups,
                first,
                last,
                result,
                index,
                isolated: groups.length <= 1,
                empty: result.length !== 0
            };
        });
    }

    public has(group:string):boolean {
        return this.elements.has(group);
    }

    public detach(group:string):boolean {
        return this.elements.delete(group);
    }

    public groups():string[] {
        return Array.from(this.elements.keys());
    }

    public add(...element: ResolvableElement[]):ElementStateQuery {
        return this.attach.apply(
            this, [ElementStateQuery.KEY_UNSORTED].concat(<any>element)
        );
    }

    public attach(group: string, ...element: ResolvableElement[]): ElementStateQuery {
        let collection: ElementReference[];

        element = [].concat(element);
        if(!group || (group = group.toString().toUpperCase().trim()).length) {
            group = KEY_UNSORTED;
        }

        if (!this.elements.has(group)) {
            this.elements.set(group, collection = []);
        } else {
            collection = this.elements.get(group);
        }

        collection.push.apply(
            collection,
            element.map((resolvable:ResolvableElement): ElementReference => {
                if(resolvable instanceof ElementReference) {
                    resolvable.resolution.group = group;
                    return resolvable;
                }

                if(resolvable instanceof ElementResolution) {
                    resolvable.group = group;
                    return new ElementReference(
                        resolvable.resolver,
                        resolvable
                    );
                }

                return new ElementReference(<ElementResolver>resolvable);
            }
        ));

        return this;
    }

}

export class ElementReference {
    constructor(public resolver: ElementResolver,
                public resolution?: ElementResolution) {
    }
}

export interface ElementState {
    (resolution: ElementResolution): boolean
}

export interface ElementStateQueryResult {
    empty: boolean,
    isolated: boolean,
    group: string,
    groups: string[],
    first: HTMLElement,
    last: HTMLElement,
    result: ElementResolution[],
    index: number
}

export class ElementResolution {

    constructor(public resolver: ElementResolver,
                public group: string,
                public element: HTMLElement,
                public index:number = -1) {
    }
}

export namespace ElementResolution {

    export const fromGroupMap = (
        map:Map<string, ResolvableElementCollections>,
        cache:boolean = true
    ):Promise<ElementResolution>[] =>
        [].concat(
            Array.from(map, ([group, resolvers]) => fromGroup(resolvers, group, cache))
        );

    export const fromGroup = (
        resolvers:ResolvableElementCollections,
        group:string,
        cache:boolean = true
    ) =>
        (<any>resolvers).map(
            (resolvable:ResolvableElement, index:number) => fromResolvable(resolvable, group, index,cache)
        );

    export const fromResolvable = (
        resolvableElement:ResolvableElement,
        group:string = ElementStateQuery.KEY_UNSORTED,
        index:number = 0,
        cache:boolean = true
    ): Promise<ElementResolution> => {
        if(resolvableElement instanceof ElementReference) {

            const {resolver, resolution} = resolvableElement;

            if(cache && resolution !== null) {
                return Promise.resolve(resolvableElement.resolution);
            }

            let task:any = resolver;
            if(typeof task === "function") {
                task = task(group, index);
            }

            return Promise
                .resolve(task)
                .then(
                (element:any) => {
                    if (resolution !== null) {
                        resolution.element = element;
                        resolution.group = group;
                        resolution.index = index;
                        return resolution
                    }

                    resolvableElement.resolution = new ElementResolution(
                        resolver,
                        group,
                        element,
                        index
                    );

                    return resolvableElement.resolution;
                }
            );
        } else if(resolvableElement instanceof ElementResolution) {
            return Promise.resolve(resolvableElement);
        }

        let task:any = resolvableElement;
        if(typeof task === "function") {
            task = task();
        }

        return Promise
            .resolve(task)
            .then(
                (element:any) => ElementResolution.fromElement(
                    element,
                    group,
                    <any>resolvableElement
                )
            );
    };


    export const fromElement = (
        element:HTMLElement,
        group:string = ElementStateQuery.KEY_UNSORTED,
        resolver: ElementResolver = <any>element,
        index:number = -1,
    ):ElementResolution =>
        new ElementResolution(
            resolver,
            group,
            element
        );

    export const fromElements = (
        group:string = ElementStateQuery.KEY_UNSORTED,
        ...element:HTMLElement[]
    ): ElementResolution[] => []
        .concat(element)
        .map((element: HTMLElement, index: number) =>
            fromElement(
                element,
                group,
                <any>element,
                index
            )
        );
}

export namespace ElementStateQuery {

    export const KEY_UNSORTED: string = "UNSORTED";

    export type ResolvableElement = ElementResolver | ElementResolution | ElementReference;
    export type ResolvableElementCollections = ElementResolver[] | ElementResolution[] | ElementReference[];
    export type ElementResolver = (...args: any[]) => HTMLElement | Promise<HTMLElement> | PromiseLike<HTMLElement> | HTMLElement;

}