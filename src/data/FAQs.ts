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
    question: 'I am having trouble installing, how do I do it?',
    answer:
      'After following the download procedure, you will see a .ZIP file. You simply need to extract this file to access the required files. If you have purchased just the data, follow the instructions included to update the simulator. If you have also purchased the simulator you first need to run the .EXE which is located in the extracted .ZIP file and then continue with the process to update the data.',
  },
  {
    question: 'After purchasing, where can I download the files from?',
    answer:
      'In the top right hand corner you will see a USER icon, after clicking on this a dropdown will appear. Inside this dropdown you will see a link which reads DOWNLOADS, this will take you to the downloads page where you can download all of your purchases.',
  },
  {
    question:
      "I have created an account on the website but I can't access the forum?",
    answer:
      'The website and the forum currently use separate accounts to work. There are plans to fully integrate them together but in the meantime they will remain separate, because of this you will need to make an account on each of them separately.',
  },
  {
    question:
      'What are the minimum system requirements I need to install and run London Control?',
    answer:
      '500MHz or faster processor speed.  Microsoft Windows 98, ME, 2000 or XP.  64MB of RAM.  100MB of free hard disk space.  800x600 pixel display, with at least 16 bit colour.',
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
  {
    question: 'Will London Control ever be available for MAC?',
    answer:
      'This is something that may be looked into in the future but for now it will remain Windows only. In the meantime the simulator does run without issue using various emulators that are available for MAC users.',
  },
];

export default FAQs;
