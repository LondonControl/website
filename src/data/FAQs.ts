import type FAQ from '@/interfaces/FAQ';

const FAQs: FAQ[] = [
  {
    question: 'How often will the data be updated?',
    answer:
      'We will release data patches every three months or sooner if AIRAC content necessitates an earlier release.',
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
      'The website and forum operate independently, therefore you need to create an account for each of them.',
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
    question: 'When launching I receive error "OLE ERROR 80045077"',
    answer:
      'This usually indicates an error with the speech recognition software, this can be fixed by ensuring you have speech and the English language pack installed or you can disable speech altogether by appending -v to the executable launch options.',
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
    question: 'Is London Control available for MAC?',
    answer:
      'Not at this time, however there are various mechanisms available for MAC users to run Windows.',
  },
  {
    question:
      'PayPal is not available in my country. Is there another way for me to make a purchase?',
    answer:
      'Yes, email **hq@londoncontrol.com** explaining this and we can process an order manually for you. As this is a manual process please allow some time for us to facilitate this.',
  },
  {
    question: 'Is London Control available as multiplayer?',
    answer:
      'London Control was never designed for simultaneous multiple users; it is a standalone simulator and there are no plans at this time to change that.',
  },
  {
    question: 'Will a Discord server be available?',
    answer:
      'When we asked the user base this question there was less than 2 per cent interest, so we decided it would not be worthwhile. There are no plans to introduce a Discord server or similar at the moment.',
  },
  {
    question: 'Is speech recognition being upgraded?',
    answer:
      'As of June 2025, we are working on enhancing the speech recognition system to make it more responsive. It has been problematic since the first days of London Control over 20 years ago, but we hope to have an upgrade by AIRAC 2509.',
  },
  {
    question: 'Can class G aircraft be controlled?',
    answer:
      "Not specifically, however there are 25 airport/CTZ and approach sectors that can be controlled, to which you can create your own flight plans for 'low and slow' traffic to integrate with other traffic.",
  },
];

export default FAQs;
