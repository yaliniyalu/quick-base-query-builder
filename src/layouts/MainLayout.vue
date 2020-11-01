<template>
    <q-layout view="hHh lpR fff">

        <q-header bordered class="bg-primary text-white" height-hint="98">
            <q-toolbar>
                <q-toolbar-title>
                    <q-avatar>
                        <img :src="require('assets/icon-64.png')" alt="">
                    </q-avatar>
                    Quick Base Query Builder
                </q-toolbar-title>
                <q-icon name="power_settings_new" size="md" class="cursor-pointer" @click="logout"/>
            </q-toolbar>

            <q-tabs align="left">
                <q-route-tab to="/" label="API" />
                <q-route-tab to="/summary" label="Summary" :disable="!isAppDetailsSet" />
                <q-route-tab to="/builder" label="Query Builder" :disable="!isAppDetailsSet" />
                <q-route-tab to="/code" label="Code Generator" :disable="!isAppDetailsSet" />
            </q-tabs>
        </q-header>

        <q-page-container>
            <keep-alive :max="4" v-if="!refreshing">
                <router-view />
            </keep-alive>
        </q-page-container>

        <q-footer class="bg-white text-grey text-center">
            <p>Quick Base Query Builder v0.0.1</p>
        </q-footer>

    </q-layout>
</template>

<script>
export default {
    name: 'MainLayout',
    data () {
        return {
            refreshing: false
        }
    },

    computed: {
        isAppDetailsSet() {
            return !!(this.$store.state.app.qbRealm && this.$store.state.app.authorization && this.$store.state.app.appId);
        },

        appKey() {
            return (this.$store.state.app.qbRealm + this.$store.state.app.authorization + this.$store.state.app.appId);
        }
    },

    watch: {
        appKey() {
            this.refreshing = true;
            this.$nextTick(() => this.refreshing = false)
        }
    },

    methods: {
        logout() {
            localStorage.removeItem('qbRealm');
            localStorage.removeItem('authorization');
            localStorage.removeItem('appId');

            location.href = '/'
        }
    }
}
</script>
