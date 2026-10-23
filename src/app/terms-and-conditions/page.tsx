import { Footer } from "@/src/features/landing-page/ui/Footer";
import { Navbar } from "@/src/features/landing-page/ui/Navbar";

export default function TermsAndConditions() {
  return (
    <>
      <Navbar />

      <main className="mx-auto mt-11 max-w-4xl px-6 py-8 leading-relaxed text-gray-800">
        <h1 className="mb-4 text-3xl font-bold">Terms and Conditions</h1>

        <p className="mb-6 text-sm text-gray-600">
          Last updated on <strong>October 23, 2026</strong>.
        </p>

        <p className="mb-6 italic">
          Please read these Terms and Conditions carefully before using
          Tripdesk.
        </p>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Acknowledgment
          </h2>

          <div className="space-y-4">
            <p>
              These Terms and Conditions govern your access to and use of Make
              Help Travel, a travel agency management platform designed to help
              travel businesses manage their operations, including bookings,
              travelers, tour packages, itineraries, payments, travel documents,
              and team activities.
            </p>

            <p>
              These Terms constitute an agreement between you and the company
              operating Make Help Travel (the "Company"). They apply to
              visitors, registered users, agency owners, employees, guides, and
              other authorized individuals who access or use the Service.
            </p>

            <p>
              By accessing or using Make Help Travel, you agree to these Terms.
              If you do not agree, you must discontinue using the Service.
            </p>

            <p>
              Your use of Make Help Travel is also subject to our Privacy
              Policy, which explains how personal information is collected,
              used, and protected.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Description of the Service
          </h2>

          <div className="space-y-4">
            <p>
              Make Help Travel provides digital tools that help travel agencies
              organize and manage their business operations. Depending on the
              features available to your account, the Service may include:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>Traveler and customer management.</li>
              <li>Booking and reservation management.</li>
              <li>Tour package and itinerary management.</li>
              <li>Payment records and financial tracking.</li>
              <li>Travel document organization.</li>
              <li>Employee management and access permissions.</li>
            </ul>

            <p>
              Make Help Travel is a management platform. Unless explicitly
              stated otherwise in a separate agreement, it does not itself act
              as a travel operator, airline, hotel, tour provider, or payment
              institution. Travel arrangements remain subject to the terms of
              the relevant service providers.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            User Accounts
          </h2>

          <div className="space-y-4">
            <p>
              To access certain features, you may need to create an account and
              provide accurate, complete, and current information. You are
              responsible for keeping your account information up to date.
            </p>

            <p>
              You are responsible for safeguarding your login credentials and
              for activities performed through your account, except where
              applicable law provides otherwise.
            </p>

            <p>
              You must not share your credentials with unauthorized individuals.
              You should notify us promptly if you suspect unauthorized access,
              compromised credentials, or other security incidents involving
              your account.
            </p>

            <p>
              We may restrict or suspend access where reasonably necessary to
              protect users, investigate suspected misuse, address security
              risks, or comply with legal obligations.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Agency Accounts and Team Permissions
          </h2>

          <div className="space-y-4">
            <p>
              Travel agencies may use Make Help Travel to manage their
              organizational information and invite authorized employees,
              guides, or other team members where supported by the Service.
            </p>

            <p>
              Agency owners and administrators are responsible for assigning
              appropriate permissions and reviewing who can access their
              agency's information.
            </p>

            <p>
              Users must not attempt to access another agency's data, bypass
              assigned permissions, impersonate another user, or use the Service
              to obtain information they are not authorized to access.
            </p>

            <p>
              Agencies are responsible for promptly updating team access when an
              employee or other authorized person no longer requires it.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Acceptable Use
          </h2>

          <p className="mb-3">
            You agree to use Make Help Travel only for lawful purposes and in
            accordance with these Terms. You must not:
          </p>

          <ul className="list-disc space-y-2 pl-6">
            <li>
              Use the Service to commit fraud or engage in unlawful activities.
            </li>
            <li>
              Upload malicious software or attempt to compromise the security of
              the platform.
            </li>
            <li>Attempt unauthorized access to accounts, systems, or data.</li>
            <li>
              Interfere with the availability, performance, or operation of the
              Service.
            </li>
            <li>
              Use another person's personal information without proper
              authorization.
            </li>
            <li>
              Upload unlawful, misleading, infringing, or otherwise prohibited
              content.
            </li>
            <li>
              Reverse engineer or attempt to extract source code except where
              applicable law permits such activity.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Bookings and Travel Arrangements
          </h2>

          <div className="space-y-4">
            <p>
              Make Help Travel helps agencies record and organize bookings,
              reservations, itineraries, tour packages, and related information.
              The accuracy and completeness of information entered into the
              platform remain the responsibility of the users and agencies
              providing it.
            </p>

            <p>
              Recording a booking in Make Help Travel does not, by itself,
              confirm a reservation with an airline, hotel, tour operator, or
              other travel provider. Users must obtain confirmation from the
              relevant provider where required.
            </p>

            <p>
              Agencies are responsible for verifying travel dates, traveler
              details, prices, availability, cancellation policies, visa
              requirements, and other applicable travel conditions before
              confirming arrangements with customers.
            </p>

            <p>
              Make Help Travel is not responsible for a third-party provider's
              cancellations, delays, service failures, price changes, or
              decisions, except to the extent responsibility cannot be excluded
              under applicable law.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Payments and Financial Records
          </h2>

          <div className="space-y-4">
            <p>
              Where available, Make Help Travel may provide features for
              recording payments, tracking balances, and organizing financial
              information associated with agency operations.
            </p>

            <p>
              Unless a feature expressly supports payment processing, entering
              or recording a payment in Make Help Travel does not transfer funds
              or independently verify that a transaction has been completed.
            </p>

            <p>
              Agencies are responsible for verifying transactions, maintaining
              accurate financial records, communicating applicable charges to
              their customers, and meeting their accounting and tax obligations.
            </p>

            <p>
              Any subscription charges, usage limits, or paid features will be
              subject to the applicable pricing information and additional terms
              presented when those services are offered.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            User Content and Data Responsibilities
          </h2>

          <div className="space-y-4">
            <p>
              You retain your rights to the content and information you submit
              to Make Help Travel, subject to the rights of other individuals
              and applicable law.
            </p>

            <p>
              You grant the Company permission to host, store, process,
              transmit, and display your submitted content as reasonably
              necessary to operate, maintain, secure, and provide the Service.
            </p>

            <p>
              You represent that you have the necessary rights and
              authorizations to upload or process the information you provide,
              including traveler details, photographs, and travel documents.
            </p>

            <p>
              You are responsible for maintaining appropriate records and, where
              necessary, obtaining permission to collect and use personal
              information belonging to travelers, employees, or other
              individuals.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Intellectual Property
          </h2>

          <div className="space-y-4">
            <p>
              The Service, including its original software, design, interface,
              branding, logos, and documentation, is owned by the Company or its
              respective licensors and is protected by applicable intellectual
              property laws.
            </p>

            <p>
              These Terms grant you a limited, non-exclusive, non-transferable
              right to access and use Make Help Travel for its intended
              purposes, subject to these Terms.
            </p>

            <p>
              You must not reproduce, distribute, modify, sell, or create
              derivative works from the Company's intellectual property without
              prior authorization, except where applicable law permits such
              activity.
            </p>

            <p>
              You retain ownership of your own content, subject to the limited
              rights granted to operate the Service and any separate agreements
              that apply.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Third-Party Services
          </h2>

          <div className="space-y-4">
            <p>
              Make Help Travel may rely on third-party services for hosting,
              authentication, database infrastructure, email delivery, payment
              processing, or other functionality.
            </p>

            <p>
              Third-party services may be governed by separate terms and privacy
              policies. We do not control all aspects of those services and
              cannot guarantee their uninterrupted availability.
            </p>

            <p>
              Your use of a third-party service may be subject to the terms
              applicable to that provider.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Service Availability and Changes
          </h2>

          <div className="space-y-4">
            <p>
              We aim to keep Make Help Travel available and functioning
              reliably. However, we do not guarantee uninterrupted or error-free
              access. The Service may occasionally be unavailable because of
              maintenance, updates, technical issues, or circumstances outside
              our reasonable control.
            </p>

            <p>
              We may update, improve, add, or discontinue features as the
              platform evolves. Where required, we will provide notice of
              material changes or discontinuation.
            </p>

            <p>
              You are responsible for maintaining appropriate copies of
              important business records where necessary. Any backup or export
              features provided by Make Help Travel should be used in accordance
              with their documented capabilities.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Suspension and Termination
          </h2>

          <div className="space-y-4">
            <p>
              You may stop using Make Help Travel at any time. If account
              deletion or subscription cancellation is available, you may use
              the applicable account settings or contact our support team.
            </p>

            <p>
              We may suspend or terminate access where there is a material
              breach of these Terms, suspected unlawful activity, a serious
              security risk, or another legitimate reason, subject to applicable
              law and any required notice.
            </p>

            <p>
              Upon termination, your right to use the affected Service ends.
              Retention, export, and deletion of account information will be
              handled in accordance with our Privacy Policy, applicable
              agreements, and legal obligations.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Limitation of Liability
          </h2>

          <div className="space-y-4">
            <p>
              To the extent permitted by applicable law, the Company will not be
              liable for indirect, incidental, special, consequential, or
              punitive damages, including loss of profits, business
              opportunities, or data, arising from the use of or inability to
              use the Service.
            </p>

            <p>
              We are not responsible for errors in information entered by users,
              unconfirmed travel reservations, or the independent actions of
              third-party travel providers, except where applicable law provides
              otherwise.
            </p>

            <p>
              Nothing in these Terms excludes or limits liability that cannot
              lawfully be excluded or limited. Any applicable liability cap must
              be interpreted consistently with mandatory law and any separate
              agreement governing your use of the Service.
            </p>

            <div className="rounded border bg-gray-50 p-4 shadow-sm">
              <h3 className="mb-2 text-lg font-bold">
                "AS IS" and "AS AVAILABLE" Disclaimer
              </h3>

              <p className="text-sm">
                To the extent permitted by applicable law, Make Help Travel is
                provided on an "AS IS" and "AS AVAILABLE" basis. We do not
                guarantee that the Service will meet every user's requirements,
                remain continuously available, or operate without errors. Any
                warranties that cannot be excluded under applicable law remain
                unaffected.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Indemnification
          </h2>

          <p>
            To the extent permitted by applicable law, you agree to be
            responsible for losses, claims, or expenses arising from your
            unlawful use of the Service, your material breach of these Terms, or
            your infringement of another person's rights. This provision does
            not apply to the extent a claim results from the Company's own
            conduct for which responsibility cannot lawfully be excluded.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Governing Law and Disputes
          </h2>

          <div className="space-y-4">
            <p>
              These Terms are intended to be governed by the laws of the Kingdom
              of Bhutan, subject to applicable mandatory legal requirements.
            </p>

            <p>
              If a dispute arises in connection with these Terms, the parties
              should first attempt to resolve it through good-faith discussions.
              Nothing in this provision prevents either party from pursuing
              remedies available under applicable law.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Changes to These Terms
          </h2>

          <p>
            We may revise these Terms from time to time to reflect changes to
            Make Help Travel, our business practices, or applicable legal
            requirements. The updated version will be published on this page
            with a revised date. Where required, we will provide additional
            notice before material changes take effect. Continued use after the
            effective date of revised Terms will be subject to applicable law
            and any required acceptance process.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 border-b pb-2 text-2xl font-semibold text-gray-900">
            Contact Us
          </h2>

          <p className="mb-3">
            If you have questions about these Terms and Conditions, please
            contact the team operating Make Help Travel through its official
            contact channels.
          </p>

          <p>
            Website:{" "}
            <a
              href="https://www.helpmaketravel.com/"
              className="text-blue-600 hover:underline"
            >
              Make Help Travel
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
