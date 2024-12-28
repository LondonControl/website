/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Markdown from 'react-markdown';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import FAQs from '@/data/FAQs';

interface Props {}

const FAQSection: React.FC<Props> = () => {
  return (
    <section className="border bg-white" id="faqs">
      <div className="mx-auto max-w-site px-6 py-24 tablet:py-32 laptop:px-8">
        <div className="divide-y divide-gray-900/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-primary">
            Frequently asked questions
          </h2>

          <Accordion type="single" collapsible className="mt-10 w-full">
            {FAQs.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-base font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base">
                  <Markdown>{faq.answer}</Markdown>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
