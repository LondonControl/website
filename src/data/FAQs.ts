const FAQs = [
  {
    question: 'How often will the data be updated?',
    answer: 'We will release data patches following the AIRAC cycle.',
  },
  {
    question:
      'I already own London Control, do I get the data package for free?',
    answer:
      'Due to the amount of work that has gone into providing the data package, we are unable to provide it for free.',
  },
  {
    question:
      'The system seems to run very slowly, what can I do to improve performance?',
    answer:
      'There are a number of options that can be set-up in the User Preferences to reduce the processing requirement of the system. These include: switching off MTCA and STCA, setting the Scan Segments to a low number, switching off vector lines and halos, not using radio communication.',
  },
  {
    question: 'When launching I receive error "OLE ERROR 80045078"',
    answer:
      'This usually indicates an error with the speech recognition software, this can be fixed by ensuring you have speech and the English language pack installed or you can disable speech altogether by appending -v to the executable launch options.',
  },
  {
    question:
      'Does London Control have help that I can access when the program is running?',
    answer:
      'Context sensitive help is available through menu options or the <F1> and <F2> keyboard keys.',
  },
];

export default FAQs;
