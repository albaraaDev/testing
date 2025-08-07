import './styles.css';

const PrivacyPolicyPage = () => {
  return (
    <>
      <div className="p-6 max-w-4xl mx-auto text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>

        <p>
          This Privacy Policy describes Our policies and procedures on the collection, use, and
          disclosure of Your information when You use the Service and tells You about Your privacy
          rights and how the law protects You.
        </p>
        <p>
          We use Your Personal data to provide and improve the Service. By using the Service, You
          agree to the collection and use of information in accordance with this Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Interpretation and Definitions</h2>
        <h3 className="text-lg font-medium mt-4">Interpretation</h3>
        <p>
          The words of which the initial letter is capitalized have meanings defined under the
          following conditions. The following definitions shall have the same meaning regardless of
          whether they appear in singular or in plural.
        </p>

        <h3 className="text-lg font-medium mt-4">Definitions</h3>
        <p>For the purposes of this Privacy Policy:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Account</strong> means a unique account created for You to access our Service or
            parts of our Service.
          </li>
          <li>
            <strong>Affiliate</strong> means an entity that controls, is controlled by or is under
            common control with a party...
          </li>
          <li>
            <strong>Application</strong> means the software program provided by the Company
            downloaded by You on any electronic device, named Hedef takip pro.
          </li>
          <li>
            <strong>Company</strong>{' '}
            {`(referred to as either "the Company", "We", "Us" or "Our" in
            this Agreement)`}
            refers to Hedef takip pro.
          </li>
          <li>
            <strong>Country</strong> refers to: Turkey.
          </li>
          <li>
            <strong>Device</strong> means any device that can access the Service such as a computer,
            a cellphone, or a digital tablet.
          </li>
          <li>
            <strong>Personal Data</strong> is any information that relates to an identified or
            identifiable individual.
          </li>
          <li>
            <strong>Service</strong> refers to the Application.
          </li>
          <li>
            <strong>Service Provider</strong> means any natural or legal person who processes the
            data on behalf of the Company...
          </li>
          <li>
            <strong>Usage Data</strong> refers to data collected automatically...
          </li>
          <li>
            <strong>You</strong> means the individual accessing or using the Service...
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Collecting and Using Your Personal Data</h2>
        <h3 className="text-lg font-medium mt-4">Types of Data Collected</h3>
        <p>
          <strong>Personal Data</strong>
        </p>
        <p>
          While using Our Service, We may ask You to provide Us with certain personally identifiable
          information that can be used to contact or identify You. This may include:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Email address</li>
          <li>First name and last name</li>
          <li>Phone number</li>
          <li>Usage Data</li>
        </ul>

        <p>
          <strong>Usage Data</strong>
        </p>
        <p>
          Usage Data is collected automatically when using the Service. It may include information
          such as IP address, browser type/version, device ID, time/date of access, etc.
        </p>

        <h3 className="text-lg font-medium mt-4">
          Information Collected while Using the Application
        </h3>
        <p>With Your prior permission, We may collect information such as:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Information regarding your location</li>
        </ul>

        <p>
          You can enable or disable access to this information at any time through Your Device
          settings.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Use of Your Personal Data</h2>
        <p>The Company may use Personal Data for purposes such as:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>To provide and maintain our Service</li>
          <li>To manage Your Account</li>
          <li>For performance of a contract</li>
          <li>To contact You</li>
          <li>To provide You with news, special offers</li>
          <li>To manage Your requests</li>
          <li>For business transfers</li>
          <li>For other purposes such as data analysis and service improvement</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Sharing of Your Personal Data</h2>
        <p>We may share Your personal information with:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Service Providers</li>
          <li>For business transfers</li>
          <li>With Affiliates</li>
          <li>With business partners</li>
          <li>With other users (public sharing)</li>
          <li>With Your consent</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">
          Retention and Transfer of Your Personal Data
        </h2>
        <p>
          Your data is retained as necessary for the purposes in this policy. It may be transferred
          to other countries and stored securely.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Disclosure of Your Personal Data</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Business Transactions</li>
          <li>Law enforcement</li>
          <li>Other legal requirements</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2">Security of Your Personal Data</h2>
        <p>
          We strive to protect Your data but cannot guarantee absolute security due to the nature of
          internet transmission.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">{`Children's Privacy`}</h2>
        <p>
          We do not knowingly collect data from anyone under 13. If you’re a parent or guardian
          aware of such data, contact us to remove it.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Links to Other Websites</h2>
        <p>
          We are not responsible for third-party sites linked in our Service. We recommend reviewing
          their privacy policies.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Changes to This Privacy Policy</h2>
        <p>We may update our policy and notify you via email and/or a notice on the Service.</p>

        <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, You can contact us:</p>
        <ul className="list-disc list-inside">
          <li>
            By email:{' '}
            <a href="mailto:skynasa2024@gmail.com" className="text-blue-600 hover:underline">
              skynasa2024@gmail.com
            </a>
          </li>
        </ul>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
