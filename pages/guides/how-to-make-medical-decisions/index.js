import GuideLayout from '../../../components/GuideLayout'

export default function HowToMakeMedicalDecisions() {
  return (
    <GuideLayout
      title="How to Approach an Important Medical Decision"
      description="Facing a medical decision? A framework for asking the right questions and feeling more informed before you decide."
      ctaText=""
      ctaTool={null}
    >
      <p style={{ background: '#FEF3C7', padding: '16px', borderRadius: '8px', fontSize: '15px', color: '#92400E' }}>
        This guide offers a general framework for approaching medical decisions thoughtfully. It is not medical advice and does not replace consultation with a qualified healthcare professional. Always discuss your specific situation with your doctor.
      </p>

      <h2 style={{ color: '#0F172A', fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>1. Write down your questions before the appointment</h2>
      <p>It's easy to forget questions in the moment. Before any important appointment, write down what you want to understand—risks, alternatives, expected outcomes, and timeline.</p>

      <h2 style={{ color: '#0F172A', fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>2. Ask about all reasonable alternatives</h2>
      <p>For non-emergency decisions, ask directly: "What other options exist, and what are the trade-offs of each?" A good provider will walk you through alternatives, not just one recommendation.</p>

      <h2 style={{ color: '#0F172A', fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>3. Consider a second opinion for major decisions</h2>
      <p>For significant procedures, diagnoses, or treatment plans, seeking a second medical opinion is a normal and reasonable step—not a sign of distrust. Many healthcare systems explicitly support this.</p>

      <h2 style={{ color: '#0F172A', fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>4. Understand urgency versus time to decide</h2>
      <p>Ask explicitly how much time you realistically have to make the decision. Some choices need to be made quickly; others allow days or weeks to gather information and think clearly.</p>

      <h2 style={{ color: '#0F172A', fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>5. Bring someone with you, if possible</h2>
      <p>A second person at appointments can help remember details, ask questions you might not think of in the moment, and provide emotional support during a stressful conversation.</p>

      <h2 style={{ color: '#0F172A', fontSize: '22px', marginTop: '32px', marginBottom: '12px' }}>The bottom line</h2>
      <p>Feeling informed reduces anxiety around medical decisions. Prepare your questions, understand your real timeline, and don't hesitate to seek a second opinion when the decision is significant.</p>
    </GuideLayout>
  )
}