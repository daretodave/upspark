export class BrowserStore {

    static getCollection<T>(name:string): Promise<T[]> {
        return new Promise((resolve: (collection: T[]) => any) => {

            let collection:Array<T>;

            let jsonCollection = localStorage.getItem(name);

            if (jsonCollection !== null) {
                try {
                    collection = JSON.parse(jsonCollection);

                    if (!Array.isArray(collection)) {
                        console.error(`Collection '${name}' was not an array after JSON::parse`);

                        collection = null;
                    }

                } catch(err) {
                    console.error(`Could not read '${name}' collection from local storage`);
                    console.error(err);
                    console.error('Defaulting to empty collection')
                }
            }

            resolve(collection || []);
        });
    }

    static rollingCollectionAppend(
        name:string,
        rollingLimit:number,
        ...items:any[]
    ): Promise<any> {
        return BrowserStore.getCollection(name).then((collection:any[]) => {
            collection.push(...items);
            collection.reverse();

            collection = collection.slice(0, rollingLimit);
            collection.reverse();

            localStorage.setItem(name, JSON.stringify(collection));
        });
    }

}