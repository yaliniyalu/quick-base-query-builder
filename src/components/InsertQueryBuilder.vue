<template>
    <div class="q-gutter-md">
        <div class="text-h5 q-mb-md">Insert/Update</div>

        <div class="row q-gutter-md">
            <div class="col">
                <q-select outlined stack-label v-model="table" :options="tables" label="Table" :bottom-slots="!!table">
                    <template v-slot:hint>
                        <resource-id :id="table.value"/>
                    </template>
                </q-select>
            </div>
            <div class="col">
                <q-select outlined stack-label v-model="mergeField" :options="fields" label="Merge Field" :loading="fieldsLoading" :disable="!table" :bottom-slots="!!mergeField">
                    <template v-slot:hint>
                        <resource-id :id="mergeField.value"/>
                    </template>
                </q-select>
            </div>
            <div class="col">
                <q-select outlined stack-label multiple use-chips v-model="fieldsToUpdate" :options="fields" label="Fields To Update" :loading="fieldsLoading" :disable="!table" :bottom-slots="!!fieldsToUpdate.length">
                    <template v-slot:hint>
                        <resource-id :id="updateFields.join(', ')"/>
                    </template>
                </q-select>
            </div>
            <div class="col">
                <q-select outlined stack-label multiple use-chips v-model="fieldsToReturn" :options="fields" label="Fields To Return" :loading="fieldsLoading" :disable="!table" :bottom-slots="!!fieldsToReturn.length">
                    <template v-slot:hint>
                        <resource-id :id="returnFields.join(', ')"/>
                    </template>
                </q-select>
            </div>
        </div>

        <div class="row q-gutter-md">
            <div class="col">
                <q-markup-table flat bordered separator="cell">
                    <tbody>
                    <tr v-if="fieldsToUpdate.length">
                        <td colspan="2">Fields To Update</td>
                    </tr>

                    <tr v-for="field in fieldsToUpdate">
                        <td>
                            {{ field.label }}<br>
                            <resource-id :id="field.value"/>
                        </td>
                        <td>
                            <q-input outlined stack-label v-model="field.defaultValue" :hint="'Type: ' + field.type" label="Value"/>
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
                                <div class="text-h6">Insert/Update Query Body</div>
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
                            <span class="text-teal">POST </span>
                            <span class="text-info">https://api.quickbase.com/v1/records</span>
                        </code>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
</template>

<script>
import http from "src/js/http";
import {filter, sort} from "src/js/utils";
import ResourceId from "components/ResourceId";
import {copyToClipboard} from "quasar";

export default {
    name: "InsertQueryBuilder",
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

            mergeField: null,
            fieldsToUpdate: [],
            fieldsToReturn: [],

            fieldsLoading: false,

            json: {

            }
        }
    },

    watch: {
        table(val) {
            this.loadFields();

            this.$set(this.json, 'to', val.value)
        },

        mergeField(val) {
            this.$set(this.json, 'mergeFieldId', val.value)
        },

        fieldsToReturn() {
            this.$set(this.json, 'fieldsToReturn', this.returnFields)
        },

        fieldsToUpdate: {
            handler(val) {
                this.$set(this.json, 'data', val.reduce((acc, v) => {
                    acc[v.value.toString()]= { value: v.defaultValue };
                    return acc
                }, {}))
            },
            deep: true
        },
    },

    computed: {
        returnFields() {
            return this.fieldsToReturn.reduce((pv, cv) => { pv.push(cv.value); return pv; }, [])
        },

        updateFields() {
            return this.fieldsToUpdate.reduce((pv, cv) => { pv.push(cv.value); return pv; }, [])
        }
    },

    methods: {
        async loadFields() {
            this.fieldsLoading = true;
            try {
                const res = await http.get(`fields?tableId=${this.table.value}`);
                sort(res.data, 'id', 'number')
                this.fields = res.data.map(v => {
                    return {
                        label: v.label,
                        value: v.id,
                        type: v.fieldType,
                        defaultValue: `{{${v.label} | ${v.fieldType}}}`,
                    }
                });
            } catch (e) {
                this.$q.notify({
                    message: 'Failed fetching fields',
                    color: 'negative'
                })
            }

            this.fieldsLoading = false
        },

        copy(text) {
            copyToClipboard(text);
            this.$q.notify({
                message: "Copied",
                color: "secondary",
                timeout: 500
            })
        },
    }
}
</script>

<style scoped>
code {
    font-size: 18px;
}
</style>