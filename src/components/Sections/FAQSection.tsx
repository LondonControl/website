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
import type FAQ from '@/interfaces/FAQ';

interface Props {}

const FAQSection: React.FC<Props> = () => {
  return (
    <section className="bg-secondary" id="faqs">
      <div className="mx-auto max-w-site px-6 py-24 tablet:py-32 laptop:px-8">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            FAQ
          </span>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-foreground tablet:text-5xl">
            Frequently asked
            <br />
            questions
          </h2>
        </div>

        <div className="mx-auto mt-16">
          <Accordion type="single" collapsible className="w-full">
            {FAQs.map((faq: FAQ, index: number) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="border-b border-border"
              >
                <AccordionTrigger className="py-6 text-left hover:no-underline [&>svg]:hidden">
                  <div className="flex w-full items-start gap-6">
                    <span className="min-w-[2.5rem] font-jetbrains text-xs font-bold text-muted-foreground/40">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-base font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <span className="ml-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-45">
                      +
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-6 pl-[3.5rem] text-base leading-relaxed text-muted-foreground">
                    <Markdown skipHtml>{faq.answer}</Markdown>
                  </div>
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
