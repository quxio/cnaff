// FAKE prototype data for the Tree tab: made-up "inspired by" relationships between ideas from populate.json
// replace with a real query once ideas can reference each other
const fakeTree = {
  name: "Pocket Weather Station",
  children: [
    {
      name: "Spin-offs",
      children: [
        {
          name: "Desk Weather",
          children: [
            { name: "Desktop focus weather" },
            { name: "Moodboard Radio" },
          ],
        },
        {
          name: "Tiny greenhouse autopilot",
          children: [
            { name: "Robot Plant Buddy" },
            { name: "Recipe Recycler" },
          ],
        },
      ],
    },
    {
      name: "Remixes",
      children: [
        {
          name: "Garage Synth",
          children: [
            { name: "Pocket Synth Pets" },
            { name: "Fridge DJ" },
          ],
        },
        { name: "Cable Critter" },
        { name: "agentic stationary tray" },
      ],
    },
    {
      name: "Projects",
      children: [
        { name: "Solar-powered v2 build" },
        { name: "Classroom weather kit" },
        { name: "Bluetooth sync app" },
      ],
    },
    {
      name: "Related",
      children: [
        { name: "Focus Garden" },
        { name: "Study room noise simulator" },
        { name: "Local Legend" },
      ],
    },
  ],
};

export default fakeTree;
