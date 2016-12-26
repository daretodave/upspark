export class UpText {

    public display:string;
    public normalized:string;

    constructor(private text: string = '') {
        this.content = text;
    }

    set content(content:string) {
        this.text = content || '';

        if(!this.text) {
            this.display = '';
        }
    }

    get content(): string {
        return this.text;
    }

}

export namespace UpText {

    const separateWordsPattern: RegExp = /(?:^\w|[A-Z]|\b\w|\s+)/g;
    const uppercaseLetterPattern: RegExp = /([A-Z])/g;
    const underscoreOrDashPattern: RegExp = new RegExp('\_|\-', 'g');

    const camelcaseReplacer = (match: string, index: number): string => {
        if (match.trim().length === 0) {
            return "";
        }
        return index == 0 ? match.toLowerCase() : match.toUpperCase();
    };

    export const getNormalizedName = (name: string): string => {
        if (name === null
            || typeof name !== 'string'
            || (name = name.trim()).length === 0) {
            return '';
        }

        return name
            .trim()
            .replace(underscoreOrDashPattern, ' ')
            .replace(separateWordsPattern, camelcaseReplacer)
            .trim()
    };


    export const getDisplayName = (name: string): string => {
        name = getNormalizedName(name);

        return name
            .replace(uppercaseLetterPattern, ' $1')
            .toLowerCase()
            .trim();
    };

}