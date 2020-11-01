<template>
    <div class="q-gutter-md">
        <div class="text-h5 q-mb-md">Delete</div>

        <div class="row q-gutter-md">
            <div class="col-8">


                <q-markup-table flat bordered separator="cell">
                    <tbody>
                    <tr class="bg-grey-3">
                        <td colspan="4">Table</td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <q-select outlined stack-label
                                      v-model="table" :options="tables" label="Table" :bottom-slots="!!table">
                                <template v-slot:hint>
                                    <resource-id :id="table.value"/>
                                </template>
                            </q-select>
                        </td>
                    </tr>
                    <tr class="bg-grey-3">
                        <td colspan="4">Where</td>
                    </tr>
                    <tr v-for="(item, index) in where" :key="index" class="where">
                        <td v-if="item.type === 'condition'">
                            <q-select outlined stack-label hide-selected fill-input use-input dense label="Field"
                                      v-model="item.field" :options="fields" :bottom-slots="!!item.field" @filter="filterFields">
                                <template v-slot:hint>
                                    Type: {{ item.field.type }}; <resource-id :id="item.field.value"/>
                                </template>
                            </q-select>
                        </td>
                        <td v-if="item.type === 'condition'">
                            <q-select outlined stack-label dense label="Operator"
                                      v-model="item.operator" :options="operators" :bottom-slots="!!item.operator">
                                <template v-slot:hint>
                                    {{ item.operator.value }}
                                </template>
                            </q-select>
                        </td>
                        <td v-if="item.type === 'condition'">
                            <q-select v-if="item.match.type === 'field'"
                                      outlined stack-label hide-selected fill-input use-input dense label="Field"
                                      v-model="item.match.field" :options="fields" :bottom-slots="!!item.match.field" @filter="filterFields">
                                <template v-slot:hint>
                                    Type: {{ item.match.field.type }}; <resource-id :id="'_FID_' + item.field.value"/>
                                </template>
                            </q-select>
                            <q-input v-else
                                     outlined stack-label dense label="Value" v-model="item.match.value"
                            />
                            <div class="q-gutter-sm">
                                <q-radio v-model="item.match.type" val="value" label="Value" />
                                <q-radio v-model="item.match.type" val="field" label="Field" />
                            </div>
                        </td>
                        <td v-if="item.type === 'operator'"></td>
                        <td v-if="item.type === 'operator'" class="operator">
                            <q-select outlined stack-label dense label="Field" v-model="item.operator" :options="logical"/>
                        </td>
                        <td v-if="item.type === 'operator'"></td>
                        <td>
                            <q-icon class="cursor-pointer" name="add_circle"    color="positive" @click="addWhere" v-if="index === (where.length - 1)"/>
                            <q-icon class="cursor-pointer" name="remove_circle" color="negative" @click="removeWhere(index)" v-else/>
                        </td>
                    </tr>

                    </tbody>
                </q-markup-table>
            </div>
            <div class="col">
                <q-card flat bordered>
                    <q-card-section>
                        <div class="row items-center no-wrap">
                            <div class="col">
                                <div class="text-h6">Delete Query Body</div>
                            </div>

                            <div class="col-auto">
                                <q-icon class="cursor-pointer text-grey" name="content_copy" size="md" @click="copy(JSON.stringify(json))" title="Copy JSON"/>
                            </div>
                        </div>
                    </q-card-section>
                    <q-separator inset/>
                    <q-card-section>
                        <pre>{{ JSON.stringify(json, null, '    ') }}</pre>
                    </q-card-section>

                    <q-separator inset/>

                    <q-card-section>
                        <code class="text-bold">
                            <span class="text-teal">DELETE </span>
                            <span class="text-info">https://api.quickbase.com/v1/records</span>
                        </code>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script>
import ResourceId from "components/ResourceId";
import http from "src/js/http";
import {filter, sort} from "src/js/utils";
import {copyToClipboard, extend} from "quasar";

let fields = [];

export default {
    name: "DeleteQueryBuilder",
    components: {ResourceId},
    props: {
        tables: {
            type: Array,
            required: true
        }
    },

    data() {
        return {
            fields: [],
            table: '',

            where: [],

            fieldsLoading: false,

            operators: [
                { label: 'Equal To',      value: 'EX' },
                { label: 'Not Equal To',  value: 'XEX' },
                { label: 'Less Than',     value: 'LT' },
                { label: 'Less Than or Equal To',    value: 'LTE' },
                { label: 'Greater Than',  value: 'GT' },
                { label: 'Greater Than or Equal To', value: 'GTE' },
                { label: 'Contains',      value: 'CT' },
                { label: 'Not Contains',  value: 'XCT' },
                { label: 'Has',           value: 'HAS' },
                { label: 'Not Has',       value: 'XHAS' },
                { label: 'Starts With',   value: 'SW' },
                { label: 'Not Starts With', value: 'XSW' },
                { label: 'Before',        value: 'BF' },
                { label: 'On or Before',  value: 'OBF' },
                { label: 'After',         value: 'AF' },
                { label: 'On or After',   value: 'OAF' },
                { label: 'During',        value: 'IR' },
                { label: 'Not During',    value: 'XIR' },
                { label: 'True Value',    value: 'TV' },
            ],

            logical: ['AND', 'OR'],

            json: {

            }
        }
    },

    watch: {
        table(val) {
            this.loadFields();

            this.where = [
                this.getWhere()
            ]

            this.$set(this.json, 'from', val.value)
        },

        where: {
            handler(val) {
                const where = this.where.reduce((acc, v, index) => {
                    if (this.where.length -1 === index) {
                        if (!(v.field || v.operator)) {
                            return acc;
                        }
                    }

                    let text;
                    if (v.type === 'condition') {
                        text = `{${v.field.value}.${v.operator.value}.'${v.match.type === 'value' ? v.match.value : '_FID_' + v.match.field.value }'}`;
                    }
                    else {
                        text = v.operator;
                    }

                    acc.push(text);
                    return acc;
                }, []);

                if (where.length) {
                    this.$set(this.json, 'where', where.join(' '));
                }
            },
            deep: true
        },
    },

    computed: {
    },

    methods: {
        async loadFields() {
            this.$q.loading.show();
            try {
                const res = await http.get(`fields?tableId=${this.table.value}`);
                sort(res.data, 'id', 'number')
                fields = res.data.map(v => {
                    return {
                        label: v.label,
                        value: v.id,
                        type: v.fieldType,
                    }
                });

                this.fields = extend(true, [], fields);
            } catch (e) {
                this.$q.notify({
                    message: 'Failed fetching fields',
                    color: 'negative'
                })
            }

            this.$q.loading.hide()
        },

        addWhere() {
            if (this.where[this.where.length - 1].type === "condition") {
                this.where.push(this.getWhere("operator"))
            }
            else {
                this.where.push(this.getWhere())
            }
        },

        removeWhere(index) {
            if (this.where.length <= 2) {
                this.where = [ this.getWhere() ];
                return;
            }

            this.$delete(this.where, index + 1);
            this.$delete(this.where, index);
        },

        copy(text) {
            copyToClipboard(text);
            this.$q.notify({
                message: "Copied",
                color: "secondary",
                timeout: 500
            })
        },

        getWhere(type = "condition") {
            return {
                type: type,
                field: "",
                operator: "",
                match: {
                    value: "",
                    field: "",
                    type: "value"
                }
            }
        },

        filterFields (val, update, abort) {
            update(() => this.fields = filter(fields, val, 'label'))
        }
    },

    mounted() {
        this.where.push(this.getWhere());
    }
}
</script>

<style lang="scss" scoped>
tr.where {
    td:not(.operator) {
        vertical-align: top;
        padding: 2px;
    }

    td:last-child {
        vertical-align: middle;
    }

    td.operator {
        vertical-align: middle;
    }
}
</style>