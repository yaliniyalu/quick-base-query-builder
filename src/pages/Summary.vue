<template>
    <q-page padding>
        <q-card flat bordered>
            <q-card-section>
                <h6 class="no-margin">{{ app.name }}</h6> <resource-id :id="app.id"></resource-id>
            </q-card-section>

            <q-separator inset />

            <q-card-section>
                <q-select
                    outlined
                    stack-label
                    v-model="table"
                    use-input
                    hide-selected
                    fill-input
                    input-debounce="0"
                    :options="tables"
                    map-options
                    option-value="id"
                    option-label="name"
                    @filter="filterFn"
                    label="Table"
                    style="width: 250px"
                >
                    <template v-slot:no-option>
                        <q-item>
                            <q-item-section class="text-grey">
                                No tables
                            </q-item-section>
                        </q-item>
                    </template>

                    <template v-slot:option="scope">
                        <q-item
                            v-bind="scope.itemProps"
                            v-on="scope.itemEvents"
                        >
                            <q-item-section>
                                <q-item-label v-html="scope.opt.name" />
                                <q-item-label caption>ID: {{ scope.opt.id }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </template>
                </q-select>
            </q-card-section>

            <q-card-section v-if="table">
                <div class="row">
                    <div class="col">
                        <q-card flat bordered>
                            <q-card-section @click="displayJSON(table, 'Table')">
                                <h6 class="no-margin">{{ table.name }}</h6> <resource-id :id="table.id"></resource-id>
                            </q-card-section>

                            <q-separator inset />

                            <q-card-section>
                                <q-tabs v-model="tableTab" class="text-teal">
                                    <q-tab name="fields" icon="text_fields" label="Fields" />
                                    <q-tab name="reports" icon="assignment" label="Reports" />
                                </q-tabs>

                                <q-tab-panels
                                    v-model="tableTab"
                                    animated
                                    swipeable
                                    vertical
                                    transition-prev="jump-up"
                                    transition-next="jump-up"
                                >
                                    <q-tab-panel name="fields">
                                        <div class="text-h5 q-mb-md">Fields</div>

                                        <q-list bordered separator>
                                            <q-item clickable v-for="field in fields" :key="field.id" @click="displayJSON(field, 'Field')">
                                                <q-item-section>
                                                    <q-item-label>{{ field.label }}</q-item-label>
                                                    <q-item-label caption>{{ field.fieldType }}</q-item-label>
                                                </q-item-section>

                                                <q-item-section side top>
                                                    <q-item-label caption><resource-id :id="field.id"/></q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-tab-panel>

                                    <q-tab-panel name="reports">
                                        <div class="text-h5 q-mb-md">Reports</div>

                                        <q-list bordered separator>
                                            <q-item clickable v-for="report in reports" :key="report.id" @click="displayJSON(report, 'Report')">
                                                <q-item-section>
                                                    <q-item-label>{{ report.name }}</q-item-label>
                                                    <q-item-label caption>{{ report.type }}</q-item-label>
                                                </q-item-section>

                                                <q-item-section side top>
                                                    <q-item-label caption><resource-id :id="report.id"/></q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-tab-panel>
                                </q-tab-panels>
                            </q-card-section>
                        </q-card>
                    </div>
                    <div class="col">
                        <q-card flat bordered v-if="jsonDisplay">
                            <q-card-section>
                                <div class="row items-center no-wrap">
                                    <div class="col">
                                        <div class="text-h6">{{ jsonDisplay.name || jsonDisplay.label }}</div>
                                        <div class="text-subtitle2">{{ jsonDisplayType }} ID: {{ jsonDisplay.id }} <q-icon class="cursor-pointer text-grey" name="content_copy" @click="copy(jsonDisplay.id)" title="Copy ID"/></div>
                                    </div>

                                    <div class="col-auto">
                                        <q-icon class="cursor-pointer text-grey" name="content_copy" size="md" @click="copy(JSON.stringify(jsonDisplay))" title="Copy Json"/>
                                    </div>
                                </div>
                            </q-card-section>
                            <q-card-section>
                                <vue-json-pretty :data="jsonDisplay" :deep="4" :showLine="false" :showDoubleQuotes="false"/>
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import { copyToClipboard, extend } from 'quasar'
import ResourceId from "components/ResourceId";
import http from "src/js/http";
import {filter, sort} from "src/js/utils";

export default {
    name: "Summary",
    components: {ResourceId},
    data() {
        return {
            tables: [],
            table: null,
            fields: null,
            reports: null,

            tableTab: 'fields',

            jsonDisplay: '',
            jsonDisplayType: ''
        }
    },

    computed: {
        app() {
            return this.$store.state.app.qbApp;
        },

        qbTables() {
            return this.$store.state.app.qbTables;
        }
    },

    watch: {
        table() {
            this.loadFields();
            this.loadReports();
            this.jsonDisplay = this.table;
            this.jsonDisplayType = 'Table';
        }
    },

    methods: {
        copy(text) {
            copyToClipboard(text);
            this.$q.notify({
                message: "Copied",
                color: "secondary",
                timeout: 500
            })
        },

        displayJSON(data, type) {
            this.jsonDisplay = data;
            this.jsonDisplayType = type;
        },

        async loadFields() {
            this.$q.loading.show();
            try {
                const res = await http.get(`fields?tableId=${this.table.id}`);
                sort(res.data, 'id', 'number')
                this.fields = res.data;
            } catch (e) {
                this.$q.notify({
                    message: 'Failed fetching fields',
                    color: 'negative'
                })
            }

            this.$q.loading.hide();
        },

        async loadReports() {
            this.$q.loading.show();
            try {
                const res = await http.get(`reports?tableId=${this.table.id}`);
                sort(res.data, 'id', 'number')
                this.reports = res.data;
            } catch (e) {
                this.$q.notify({
                    message: 'Failed fetching reports',
                    color: 'negative'
                })
            }

            this.$q.loading.hide();
        },

        filterFn (val, update, abort) {
            update(() => this.tables = filter(this.qbTables, val, 'name'))
        }
    },

    mounted() {
        this.tables = extend(true, [], this.qbTables);
    }
}
</script>

<style scoped>

</style>