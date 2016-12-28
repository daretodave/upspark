import KEY_UNSORTED = Answer.KEY_UNSORTED;
import ElementResolver = Answer.ElementResolver;
import ResolvableElement = Answer.ResolvableElement;
import ResolvableElementCollections = Answer.ResolvableElementCollections;

export class Answer {

    //
    // make compute resolve the predicates
    // maybe chain compute/solve to allow for different routes
    // make solve perform compute sync
    // make solveFor
    // make pristine return a new answer without attachments
    // make branch to return a new answer with different elements
    // make merge to return a new answer with the same elements and predicates
    // make isPristine to return if attachments are provided
    // make a method to return a new answer with more predicates
    // make a cache policy? or just add option to cache predicate
    // make generic or allow any
    // split in to different files
    // profit
    //

    private elements = new Map<string, ElementReference[]>();
    private predicates:ElementState[];

    constructor(private cache: boolean = true) {
    }

    public getPredicates() {
        return this.predicates;
    }

    public getTopics():string[] {
        return Array.from(this.elements.keys());
    }

    public has(group:string):boolean {
        return this.elements.has(group);
    }

    public compute(): Promise<ElementStateQueryResult> {
        return this.computeFor.apply(this, this.elements);
    }

    public attach(...element: ResolvableElement[]) {
        return this.link.apply(this, [KEY_UNSORTED].concat(<any>element));
    }

    public unlink(group:string):boolean {
        return this.elements.delete(group);
    }

    public predicate(...predicate:ElementState[]):Answer {
        this.predicates.push.apply(
            this.predicates,
            predicate
        );
        return this;
    }

    public computeFor(...predicate: ElementState[]): Promise<ElementStateQueryResult> {
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

            let empty:boolean = result.length !== 0;
            let isolated:boolean = group.length !== 0;

            return {group,groups,first,last,result,index,isolated,empty};
        });
    }

    private remove(...reference:ElementReference[]):number {
        let count:number = 0;

        reference = [].concat(reference);
        reference.forEach((element:ElementReference) => {
            if(!this.elements.has(element.resolution.group)) {
                return;
            }
            let group:ElementReference[] = this.elements.get(element.resolution.group);

            let index = group.indexOf(element);
            if (index === -1) {
                return;
            }
            group.slice(index, 1);

            count += 1;
        });

        return count;
    }

    public detach(...element: ResolvableElement[]):number {
        let count:number = 0;

        element = [].concat(element);

        element.forEach((resolvable:ResolvableElement): ElementReference => {
            if(resolvable instanceof ElementReference) {
                count += this.remove(resolvable);
                return;
            }

            if(resolvable instanceof ElementResolution) {
                if(!resolvable.container) {
                    return;
                }

                let index = resolvable.container.indexOf(resolvable);
                if (index === -1) {
                    return;
                }
                resolvable.container.slice(index, 1);

                count += 1;
                return;
            }

            Array.from(this.elements).forEach(
                ([group, entries]) => {
                    let match:ElementReference[] = entries.filter((entry:ElementReference) => entry.resolver === resolvable);

                    match.forEach((entry:ElementReference) => {
                        let index = entries.indexOf(entry);
                        if (index === -1) {
                            return;
                        }
                        entries.slice(index, 1);

                        count += 1;
                    });
                }
            );

        });

        return count;
    }


    public link(topic: string, ...element: ResolvableElement[]): Answer {
        let collection: ElementReference[];

        element = [].concat(element);

        if(!topic || (topic = topic.toString().toUpperCase().trim()).length) {
            topic = KEY_UNSORTED;
        }

        if (!this.elements.has(topic)) {
            this.elements.set(topic, collection = []);
        } else {
            collection = this.elements.get(topic);
        }

        collection.push.apply(
            collection,
            element.map((resolvable:ResolvableElement): ElementReference => {
                if(resolvable instanceof ElementReference) {
                    resolvable.resolution.group = topic;
                    return resolvable;
                }

                if(resolvable instanceof ElementResolution) {
                    resolvable.group = topic;
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
                public index:number = -1,
                public container:ElementResolution[] = null) {
    }
}

export namespace ElementResolution {

    export const fromGroupMap = (
        map:Map<string, ResolvableElementCollections>,
        cache:boolean = true,
        container:ElementResolution[] = null
    ):Promise<ElementResolution>[] =>
        [].concat(
            Array.from(map, ([group, resolvers]) => fromGroup(resolvers, group, cache, container))
        );

    export const fromGroup = (
        resolvers:ResolvableElementCollections,
        group:string,
        cache:boolean = true,
        container:ElementResolution[] = null,
    ) =>
        (<any>resolvers).map(
            (resolvable:ResolvableElement, index:number) => fromResolvable(resolvable, group, index, cache, container)
        );

    export const fromResolvable = (
        resolvableElement:ResolvableElement,
        group:string = Answer.KEY_UNSORTED,
        index:number = 0,
        cache:boolean = true,
        container:ElementResolution[] = null
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
                        resolution.container = container;
                        return resolution
                    }

                    resolvableElement.resolution = new ElementResolution(
                        resolver,
                        group,
                        element,
                        index,
                        container
                    );

                    return resolvableElement.resolution;
                }
            );
        } else if(resolvableElement instanceof ElementResolution) {
            resolvableElement.group = group;
            resolvableElement.index = index;
            resolvableElement.container = container;
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
                    <any>resolvableElement,
                    index,
                    container
                )
            );
    };


    export const fromElement = (
        element:HTMLElement,
        group:string = Answer.KEY_UNSORTED,
        resolver: ElementResolver = <any>element,
        index:number = -1,
        container: ElementReference[] = null
    ):ElementResolution =>
        new ElementResolution(
            resolver,
            group,
            element
        );

    export const fromElements = (
        group:string = Answer.KEY_UNSORTED,
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

export namespace Answer {

    export const KEY_UNSORTED: string = "UNSORTED";

    export type ResolvableElement = ElementResolver | ElementResolution | ElementReference;
    export type ResolvableElementCollections = ElementResolver[] | ElementResolution[] | ElementReference[];
    export type ElementResolver = (...args: any[]) => any | Promise<HTMLElement> | PromiseLike<HTMLElement> | HTMLElement;

}