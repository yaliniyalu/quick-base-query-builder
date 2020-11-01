<template>
    <q-page padding>
        <q-card flat bordered>
            <q-card-section>
                <h6 class="no-margin">{{ app.name }}</h6> <resource-id :id="app.id"></resource-id>
            </q-card-section>

            <q-separator inset />

            <q-card-section>
                <q-tabs v-model="tab" class="text-teal">
                    <q-tab name="insert" icon="post_add" label="Insert/Update" />
                    <q-tab name="delete" icon="delete" label="Delete" />
                    <q-tab name="query"  icon="grading" label="Query" />
                </q-tabs>

                <q-tab-panels
                    v-model="tab"
                    animated
                    swipeable
                    vertical
                    transition-prev="jump-up"
                    transition-next="jump-up"
                    keep-alive
                >
                    <q-tab-panel name="insert">
                        <insert-query-builder :tables="tables"/>
                    </q-tab-panel>

                    <q-tab-panel name="delete">
                        <delete-query-builder :tables="tables"/>
                    </q-tab-panel>

                    <q-tab-panel name="query">
                        <select-query-builder :tables="tables"/>
                    </q-tab-panel>
                </q-tab-panels>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script>
import ResourceId from "components/ResourceId";
import http from "src/js/http";
import {sort} from "src/js/utils";
import {extend} from "quasar";
import InsertQueryBuilder from "components/InsertQueryBuilder";
import DeleteQueryBuilder from "components/DeleteQueryBuilder";
import SelectQueryBuilder from "components/SelectQueryBuilder";

export default {
    name: "Builder",
    components: {SelectQueryBuilder, DeleteQueryBuilder, InsertQueryBuilder, ResourceId},
    data() {
        return {
            tab: 'insert',
            tables: [],
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

    methods: {

    },

    mounted() {
        this.tables = this.qbTables.reduce((acc, v) => {
            acc.push({ label: v.name, value: v.id })
            return acc;
        }, [])
    }
}
</script>

<style scoped>

</style>