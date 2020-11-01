<template>
    <q-page padding class="q-gutter-md">
        <div class="row">
            <div class="col text-center">
                <q-btn outline label="Generate" @click="generate" />
            </div>
        </div>
        <div class="row">
            <div class="col">
                <q-card flat bordered>
                    <q-card-section>
                        <div class="text-h6">Template</div>
                    </q-card-section>
                    <q-separator inset=""></q-separator>
                    <q-card-section>
                        <codemirror v-model="template" :options="cmOptions" />
                    </q-card-section>
                    <q-separator inset=""></q-separator>
                    <q-card-section>
                        <p>
                            Used templating engine was <a href="https://mozilla.github.io/nunjucks/templating.html" target="_blank">nunjucks</a>. Syntax similar to jinja2.<br>
                            <i>Custom Filters:</i><br>
                            camel_case => Convert string to camelCase<br>
                            pascal_case => Convert string to PascalCase<br>
                            snake_case => Convert string to snake_case<br>
                            kebab_case => Convert string to kebab-case<br>
                            <br>
                            For additional filters see nunjucks docs.<br>
                            The structure of data is like<br>
                            <code>{ app: {}, tables: [{ fields: [{}], reports: [{}] }] }</code><br>
                            For contents of individual json see summary page.
                        </p>
                    </q-card-section>
                </q-card>
            </div>
            <div class="col">
                <q-card flat bordered>
                    <q-card-section>
                        <div class="row items-center no-wrap">
                            <div class="col">
                                <div class="text-h6">Generated Code</div>
                            </div>

                            <div class="col-auto">
                                <q-icon class="cursor-pointer text-grey" name="content_copy" size="md" @click="copy(this.code)" title="Copy JSON"/>
                            </div>
                        </div>
                    </q-card-section>
                    <q-separator inset=""></q-separator>
                    <q-card-section>
                        <pre>{{ this.code }}</pre>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script>
import 'codemirror/mode/jinja2/jinja2.js'
import 'codemirror/theme/eclipse.css'

import http from "src/js/http";
import {sort} from "src/js/utils";
import CodeGenerator from "src/js/code-generator";
import {copyToClipboard} from "quasar";

export default {
    name: "CodeGenerator",
    data: () => {
        return {
            template: '',
            code: "",
            cmOptions: {
                tabSize: 4,
                mode: 'jinja2',
                theme: 'eclipse',
                lineNumbers: true,
                line: true,
            },
            data: null
        }
    },
    methods: {
        async generate() {
            this.$q.loading.show();
            if (!this.data) {
                await this.loadData();
            }

            const cg = new CodeGenerator();
            this.code = cg.generate(this.template, this.data);
            this.$q.loading.hide();
        },

        async loadData() {
            const app = this.$store.state.app.qbApp;
            const tables = this.$store.state.app.qbTables;

            for (let i = 0; i < tables.length - 1; i++) {
                tables[i]['fields'] = await this.loadFields(tables[i].id).catch();
                tables[i]['reports'] = await this.loadReports(tables[i].id).catch();
            }

            this.data = {
                app,
                tables
            }
        },

        async loadFields(table) {
            const res = await http.get(`fields?tableId=${table}`);
            sort(res.data, 'id', 'number')
            return res.data;
        },

        async loadReports(table) {
            const res = await http.get(`reports?tableId=${table}`);
            sort(res.data, 'id', 'number')
            return res.data;
        },

        copy(text) {
            copyToClipboard(text);
            this.$q.notify({
                message: "Copied",
                color: "secondary",
                timeout: 500
            })
        },
    },

    mounted() {
        this.template = `//App Name: {{ app.name }}
//App Id: {{ app.id }}

class TablesEnum {
{% for table in tables %}
    const TABLE_{{ table.name | snake_case | upper }} = "{{ table.id }}";
{% endfor %}
}

{% for table in tables %}
class {{ table.name | pascal_case }} {
    const TABLE_ID = "{{ table.id }}";

{% for field in table.fields %}
    const FIELD_{{ field.label | snake_case | upper }} = {{ field.id }};
{% endfor %}

{% for report in table.reports %}
    const REPORT_{{ report.name | snake_case | upper }} = {{ report.id }};
{% endfor %}
}
{% endfor %}`;
    }
}
</script>

<style scoped>

</style>