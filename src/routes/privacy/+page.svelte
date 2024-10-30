<script lang="ts">
    import CustomFooter from '$lib/components/CustomFooter.svelte';
    import NewNavbar from '$lib/components/NewNavbar.svelte';
</script>

<NewNavbar/>
<div class="container my-16">
    <h1 class="text-4xl font-bold mb-5">Privacy Policy</h1>
    <p class="mb-6">Welcome to CrateBytes! Your privacy is very important to us. This Privacy Policy describes how we
        collect, use, and protect your information when you use our website and services. By using CrateBytes, you
        agree to the collection and use of information in accordance with this policy.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
    <p class="mb-4">We collect information to provide and improve our services. The types of data we collect
        include:</p>

    <h3 class="text-xl font-semibold mt-6 mb-3">A. Personal Information</h3>
    <p class="mb-4">When you log in to CrateBytes, we only collect basic profile information from the authentication
        provider you choose:</p>
    <ul class="list-disc list-inside mb-4">
        <li><strong>Google OAuth</strong></li>
        <li><strong>GitHub OAuth</strong></li>
        <li><strong>Discord OAuth</strong></li>
    </ul>
    <p class="mb-4">Through these providers, we may collect:</p>
    <ul class="list-disc list-inside mb-4">
        <li>Your username or display name</li>
        <li>Email address</li>
        <li>Profile picture (if available)</li>
    </ul>
    <p class="italic mb-6">No sensitive data, such as passwords or other private account details, are stored or accessible
        to us.</p>

    <h3 class="text-xl font-semibold mt-6 mb-3">B. Usage Data</h3>
    <p class="mb-4">We may collect information on how the service is accessed and used, including:</p>
    <ul class="list-disc list-inside mb-6">
        <li>IP address</li>
        <li>Browser type and version</li>
        <li>Date and time of access</li>
        <li>Pages visited</li>
    </ul>
    <p>This data is collected to improve the service and enhance security.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
    <p class="mb-4">CrateBytes uses your information to:</p>
    <ul class="list-disc list-inside mb-6">
        <li>Provide and maintain our services</li>
        <li>Authenticate and authorize user access</li>
        <li>Improve and personalize the user experience</li>
        <li>Monitor usage and performance</li>
        <li>Ensure the security of our platform</li>
    </ul>

    <h2 class="text-2xl font-semibold mt-8 mb-4">3. Third-Party Authentication Providers</h2>
    <p class="mb-4">We utilize third-party authentication providers (Google, GitHub, and Discord) solely for user
        login purposes. By using these providers, you are subject to their individual privacy policies:</p>
    <ul class="list-disc list-inside mb-6">
        <li><a href="https://policies.google.com/privacy" class="text-blue-600 underline" target="_blank">Google Privacy Policy</a></li>
        <li><a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" class="text-blue-600 underline" target="_blank">GitHub Privacy Policy</a></li>
        <li><a href="https://discord.com/privacy" class="text-blue-600 underline" target="_blank">Discord Privacy Policy</a></li>
    </ul>
    <p>We do not have access to your password or other sensitive account information from these providers.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
    <p class="mb-6">We take data security seriously and implement industry-standard security measures to protect
        your data. Access to personal information is restricted to authorized personnel only. However, no online
        platform can guarantee absolute security, and users are encouraged to use caution when sharing personal
        data.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">5. Data Retention</h2>
    <p class="mb-6">We retain your data only for as long as necessary to provide our services, comply with legal
        obligations, resolve disputes, and enforce our agreements. If you wish to delete your account, please
        contact us, and we will permanently delete your data from our systems.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
    <p class="mb-4">Depending on your location, you may have rights regarding your personal information, such as:</p>
    <ul class="list-disc list-inside mb-6">
        <li>Accessing your data</li>
        <li>Requesting corrections</li>
        <li>Requesting deletion</li>
        <li>Restricting processing</li>
    </ul>
    <p>If you wish to exercise any of these rights, please contact us at <a href="mailto:support@cratebytes.com"
            class="text-blue-600 underline">support@cratebytes.com</a>.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">7. Changes to This Privacy Policy</h2>
    <p class="mb-6">We may update this Privacy Policy from time to time. We will notify you of any significant
        changes by posting the new Privacy Policy on this page and updating the effective date. We encourage you to
        review this Privacy Policy periodically for any updates.</p>

    <h2 class="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
    <p class="mb-6">If you have any questions about this Privacy Policy, please contact us at:</p>
    <p><strong>Email:</strong> <a href="mailto:support@cratebytes.com" class="text-blue-600 underline">support@cratebytes.com</a></p>
</div>
<CustomFooter/>