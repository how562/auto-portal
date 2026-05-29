import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

export interface ContactTheCavendersPageContent {
  header?: PageHeaderConfig;
  hero: {
    title: string;
    subtitle: string;
    supportingText: string;
    backgroundImageUrl: string;
  };
  intro: {
    heading: string;
    body: string;
    leadershipImageUrl: string;
    leadershipImageAlt: string;
  };
  form: {
    cardHeading: string;
    trustNote: string;
    submitLabel: string;
    successTitle: string;
    successMessage: string;
  };
  quote: {
    text: string;
    attribution: string;
  };
}

export const CONTACT_THE_CAVENDERS_PAGE_CONTENT: ContactTheCavendersPageContent = {
  hero: {
    title: "Contact The Cavenders",
    subtitle: "Your voice matters.",
    supportingText:
      "Whether you have feedback, a concern, a question, or a positive experience to share, Rob and Lee Cavender want to hear directly from you.",
    backgroundImageUrl: "/images/hero/community.jpg",
  },
  intro: {
    heading: "We're listening.",
    body: `Whether it's feedback, a question, a concern, or a positive experience, we want to hear from you.

This message will go straight to the leadership team behind the Cavender Auto Group — a family-owned business proudly serving Texas for over 80 years.

We believe in listening, learning, and leading with confidence. Your voice matters, and we're here to help however we can.

Fill out the form below and a member of our leadership team will review and respond as soon as possible.`,
    leadershipImageUrl: "/images/hero/community.jpg",
    leadershipImageAlt: "Rob and Lee Cavender",
  },
  form: {
    cardHeading: "Send a message",
    trustNote:
      "Messages submitted through this form are reviewed directly by Cavender Auto Group leadership.",
    submitLabel: "Send Message",
    successTitle: "Thank you for reaching out.",
    successMessage:
      "Your message has been received by our leadership team. We will review it and respond as soon as possible.",
  },
  quote: {
    text: "Leadership starts with listening.",
    attribution: "— Rob & Lee Cavender",
  },
};
