<template>
    <div>
        <div class="mb-3">
            <div class="alert">
                <strong>{{ $t("smtpOAuth2SetupTitle") }}</strong>
                <ol class="mb-0 mt-2">
                    <li>{{ $t("smtpOAuth2Step1") }}</li>
                    <li>{{ $t("smtpOAuth2Step2Graph") }}</li>
                    <li>{{ $t("smtpOAuth2Step3") }}</li>
                    <li>{{ $t("smtpOAuth2Step4Graph") }}</li>
                </ol>
                <div class="mt-2">
                    <small class="text-muted">{{ $t("smtpOAuth2GraphNote") }}</small>
                </div>
            </div>
        </div>

        <h5 class="mt-4 mb-3">{{ $t("smtpOAuth2HeaderOAuth") }}</h5>

        <div class="mb-3">
            <label for="oauth2-tenant-id" class="form-label">{{ $t("smtpOAuth2TenantId") }}</label>
            <input
                id="oauth2-tenant-id"
                v-model="$parent.notification.smtpOAuth2TenantId"
                type="text"
                class="form-control"
                required
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <div class="form-text">{{ $t("smtpOAuth2TenantIdDescription") }}</div>
        </div>

        <div class="mb-3">
            <label for="oauth2-client-id" class="form-label">{{ $t("smtpOAuth2ClientId") }}</label>
            <input
                id="oauth2-client-id"
                v-model="$parent.notification.smtpOAuth2ClientId"
                type="text"
                class="form-control"
                required
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            />
            <div class="form-text">{{ $t("smtpOAuth2ClientIdDescription") }}</div>
        </div>

        <div class="mb-3">
            <label for="oauth2-client-secret" class="form-label">{{ $t("smtpOAuth2ClientSecret") }}</label>
            <HiddenInput
                id="oauth2-client-secret"
                v-model="$parent.notification.smtpOAuth2ClientSecret"
                :required="true"
                autocomplete="new-password"
            ></HiddenInput>
            <div class="form-text">{{ $t("smtpOAuth2ClientSecretDescription") }}</div>
        </div>

        <h5 class="mt-4 mb-3">{{ $t("smtpOAuth2HeaderEmail") }}</h5>

        <div class="mb-3">
            <label for="oauth2-sender-address" class="form-label">{{ $t("smtpOAuth2SenderAddress") }}</label>
            <input
                id="oauth2-sender-address"
                v-model="$parent.notification.smtpOAuth2SenderAddress"
                type="email"
                class="form-control"
                required
                placeholder="sender@yourdomain.com"
            />
            <div class="form-text">{{ $t("smtpOAuth2SenderAddressDescription") }}</div>
        </div>

        <h5 class="mt-4 mb-3">{{ $t("smtpOAuth2HeaderEmail") }}</h5>

        <div class="mb-3">
            <label for="oauth2-to-email" class="form-label">{{ $t("To Email") }}</label>
            <input
                id="oauth2-to-email"
                v-model="$parent.notification.smtpOAuth2To"
                type="text"
                class="form-control"
                autocomplete="false"
                placeholder="recipient@example.com"
                :required="!hasRecipient"
            />
        </div>

        <div class="mb-3">
            <label for="oauth2-cc" class="form-label">{{ $t("smtpCC") }}</label>
            <input
                id="oauth2-cc"
                v-model="$parent.notification.smtpOAuth2CC"
                type="text"
                class="form-control"
                autocomplete="false"
                :required="!hasRecipient"
            />
        </div>

        <div class="mb-3">
            <label for="oauth2-bcc" class="form-label">{{ $t("smtpBCC") }}</label>
            <input
                id="oauth2-bcc"
                v-model="$parent.notification.smtpOAuth2BCC"
                type="text"
                class="form-control"
                autocomplete="false"
                :required="!hasRecipient"
            />
        </div>

        <div class="mb-3">
            <label for="oauth2-subject-email" class="form-label">{{ $t("emailCustomSubject") }}</label>
            <TemplatedInput
                id="oauth2-subject-email"
                v-model="$parent.notification.smtpOAuth2CustomSubject"
                :required="false"
                placeholder=""
            ></TemplatedInput>
            <div class="form-text">{{ $t("leave blank for default subject") }}</div>
        </div>

        <div class="mb-3">
            <label for="oauth2-body-email" class="form-label">{{ $t("emailCustomBody") }}</label>
            <TemplatedTextarea
                id="oauth2-body-email"
                v-model="$parent.notification.smtpOAuth2CustomBody"
                :required="false"
                placeholder=""
            ></TemplatedTextarea>
            <div class="form-text">{{ $t("leave blank for default body") }}</div>
        </div>

        <div class="mb-3">
            <div class="form-check">
                <input
                    id="oauth2-use-html-body"
                    v-model="$parent.notification.smtpOAuth2HtmlBody"
                    class="form-check-input"
                    type="checkbox"
                    value=""
                />
                <label class="form-check-label" for="oauth2-use-html-body">
                    {{ $t("Use HTML for custom E-mail body") }}
                </label>
            </div>
        </div>
    </div>
</template>

<script>
import HiddenInput from "../HiddenInput.vue";
import TemplatedInput from "../TemplatedInput.vue";
import TemplatedTextarea from "../TemplatedTextarea.vue";

export default {
    components: {
        HiddenInput,
        TemplatedInput,
        TemplatedTextarea,
    },
    computed: {
        /**
         * Checks whether at least one recipient field is filled
         * @returns {boolean} True if at least one recipient is set
         */
        hasRecipient() {
            if (
                this.$parent.notification.smtpOAuth2To ||
                this.$parent.notification.smtpOAuth2CC ||
                this.$parent.notification.smtpOAuth2BCC
            ) {
                return true;
            } else {
                return false;
            }
        },
    },
    mounted() {
        // No defaults needed for Graph API-based implementation
    },
};
</script>
