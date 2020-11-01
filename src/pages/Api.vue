<template>
    <q-page padding class="flex justify-center">
        <q-card flat bordered style="width: 600px">
            <q-card-section>
                <h3>Quick Base Query Builder</h3>
            </q-card-section>
            <q-form @submit="set">
                <q-card-section class="q-gutter-md text-center">
                    <p>Set your app details to get started</p>
                    <q-input outlined stack-label v-model="realm"
                             label="QB-Realm-Hostname"
                             hint="Example: demo.quickbase.com"
                             :rules="[val => !!val || 'QB-Realm-Hostname is required']"
                    />

                    <q-input outlined stack-label v-model="auth"
                             label="Authorization"
                             hint="Example: QB-USER-TOKEN xxxxxx_xxx_xxxxxxxxxxxxxxxxxxxxxxx"
                             :rules="[val => !!val || 'Authorization is required']"
                    />

                    <q-input outlined stack-label v-model="appId"
                             label="App ID"
                             hint="Example: bp2ryku2u"
                             :rules="[val => !!val || 'App Id is required']"
                    />

                    <q-btn type="submit" outline color="primary" label="Set" />
                </q-card-section>
            </q-form>
        </q-card>
    </q-page>
</template>

<script>
import http from "src/js/http";
import {sort} from "src/js/utils";

export default {
    name: "Api",
    data() {
        return {
            realm: '',
            auth: '',
            appId: ''
        }
    },

    methods: {
        async set() {
            http.defaults.headers = {
                Authorization: this.auth,
                'QB-Realm-Hostname': this.realm
            };

            try {
                this.$q.loading.show();
                const res1 = await http.get(`apps/${this.appId}`);
                const res2 = await http.get(`tables?appId=${this.appId}`);

                this.setAuthStore(this.realm, this.auth, this.appId);
                this.setAuthLocal(this.realm, this.auth, this.appId);

                sort(res2.data, 'name');

                this.$store.commit('app/updateQbApp', res1.data);
                this.$store.commit('app/updateQbTables', res2.data);

                await this.$router.push('/summary');
            }
            catch (e) {
                this.$q.notify({
                    message: 'The entered details are invalid. Please check and retry again.',
                    color: 'negative'
                })
            }

            this.$q.loading.hide();
        },

        setAuthStore(realm, auth, appId) {
            this.$store.commit('app/updateRealm', realm);
            this.$store.commit('app/updateAuthorization', auth);
            this.$store.commit('app/updateAppId', appId);
        },

        setAuthLocal(realm, auth, appId) {
            localStorage.setItem('qbRealm', realm);
            localStorage.setItem('authorization', auth);
            localStorage.setItem('appId', appId);
        }
    },

    mounted() {
        this.realm = localStorage.getItem('qbRealm')
        this.auth  = localStorage.getItem('authorization')
        this.appId = localStorage.getItem('appId')
    }
}
</script>

<style scoped>

</style>