import nunjucks from 'nunjucks';

class CodeGenerator {
    constructor() {
        const env = new nunjucks.Environment(null, {
            trimBlocks: true,
            autoescape: false
        });
        env.addFilter('snake_case', str => {
            return str && str
                .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                .map(x => x.toLowerCase())
                .join('_')
        });

        env.addFilter('kebab_case', str => {
            return str && str
                .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
                .map(x => x.toLowerCase())
                .join('-')
        });

        env.addFilter('camel_case', str => {
            return str
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        });

        env.addFilter('pascal_case', str => {
            return str
                .replace(/[-_]+/g, ' ')
                .replace(/[^\w\s]/g, '')
                .replace(/\s+(.)(\w+)/g, ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`)
                .replace(/\s/g, '')
                .replace(/\w/, s => s.toUpperCase())
        });

        this.env = env;
    }

    generate(template, data) {
        return this.env.renderString(template, data);
    }
}

export default CodeGenerator;