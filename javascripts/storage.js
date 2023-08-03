let contacts = [{
        name: "Anton Mayer",
        color: "#0223CF",
        email: "antom@gmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Anja Schulz",
        color: "#CB02CF",
        email: "schulz@hotmail",
        phone: "+49 2812830213",
    },
    {
        name: "Benedikt Ziegler",
        color: "#FFA800",
        email: "benedikt@gmail",
        phone: "+49 2812830213",
    },
    {
        name: "David Eisenberg",
        color: "#9327FF",
        email: "davidberg@gmail",
        phone: "+49 2812830213",
    },
    {
        name: "Elena Schmidt",
        color: "#02CF2F",
        email: "elena.schmidt@gmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Fabian Fischer",
        color: "#EE00D6",
        email: "fabian.fischer@hotmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Gabriele Wagner",
        color: "#0190E0",
        email: "gabriele.wagner@gmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Hans Müller",
        color: "#FF5C00",
        email: "hans.mueller@hotmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Ines Bauer",
        color: "#4E963D",
        email: "ines.bauer@gmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Johannes Mayer",
        color: "#32DAFF",
        email: "johannes.mayer@hotmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Katrin Schuster",
        color: "#9327FF",
        email: "katrin.schuster@gmail.com",
        phone: "+49 2812830213",
    },
    {
        name: "Lena Wagner",
        color: "#EE00D6",
        email: "lena.wagner@hotmail.com",
        phone: "+49 2812830213",
    },
];

let tasks = [{
        title: "Call potential clients",
        description: "Make the product presentation to prospective buyers",
        status: "todo",
        category: "sales",
        priority: "urgent",
        subtasks: [
            { name: "Follow up with leads", status: "inProgress" },
            { name: "Schedule product demos", status: "done" }
        ],
        dueDate: "2022-08-15",
        assignedTo: [contacts[0], contacts[2], contacts[3]],
    },
    {
        title: "Organize Financial Records",
        description: "Review and organize financial records, including invoices, receipts, and expense reports, to ensure accurate bookkeeping and easy retrieval for auditing purposes",
        status: "todo",
        category: "backoffice",
        priority: "urgent",
        subtasks: [
            { name: "Sort and file invoices", status: "inProgress" },
            { name: "Create expense reports", status: "inProgress" }
        ],
        dueDate: "2022-08-16",
        assignedTo: [contacts[6], contacts[4], contacts[8]],
    },
    {
        title: "Update website design",
        description: "Revamp the existing website design to improve user experience and align with the latest design trends. Enhance visual aesthetics, optimize page load speed, and ensure responsiveness across different devices and screen sizes.",
        status: "inProgress",
        category: "design",
        priority: "medium",
        subtasks: [
            { name: "Conduct user testing", status: "done" },
            { name: "Optimize site navigation", status: "inProgress" }
        ],
        dueDate: "2022-06-30",
        assignedTo: [contacts[1], contacts[4], contacts[5]],
    },
    {
        title: "Review project proposal",
        description: "Thoroughly review the project proposal and provide feedback on its feasibility, strategic alignment, and potential impact. Assess the proposed budget, timeline, and resource allocation. Identify any areas of improvement or concerns and communicate them to the project team.",
        status: "awaitingFeedback",
        category: "marketing",
        priority: "low",
        subtasks: [
            { name: "Analyze cost-benefit ratio", status: "done" },
            { name: "Evaluate risks and contingencies", status: "inProgress" }
        ],
        dueDate: "2022-07-15",
        assignedTo: [contacts[6], contacts[7], contacts[8]],
    },
    {
        title: "Prepare quarterly report",
        description: "Compile financial data and analysis to create a comprehensive quarterly report for the management team. Include key performance indicators, budget analysis, and recommendations for improvement.",
        status: "done",
        category: "backoffice",
        priority: "urgent",
        subtasks: [
            { name: "Analyze revenue trends", status: "done" },
            { name: "Summarize expenditure breakdown", status: "done" }
        ],
        dueDate: "2022-04-30",
        assignedTo: [contacts[7], contacts[8], contacts[9]],
    },
];


let categories = [{
        name: "Sales",
        color: "#FC71FF",
    },
    {
        name: "Backoffice",
        color: "#1FD7C1",
    },
    {
        name: "Marketing",
        color: "#0038FF",
    },
    {
        name: "Design",
        color: "#FF7A00",
    },
    {
        name: "Media",
        color: "#FF0000",
    },
];

/* ***************************************************************** */

function getInitials(name) {
    let initials = "";
    let splitted_name = name.split(" ");

    if (splitted_name.length > 0 && splitted_name[0].length > 0) {
        initials += splitted_name[0].charAt(0);
    }

    if (splitted_name.length > 1 && splitted_name[1].length > 0) {
        initials += splitted_name[1].charAt(0);
    }
    return initials;
}

/* ****************************************************************+ */

const STORAGE_TOKEN = "MLE4FP69ONVV67KMFU3FKXMYW4QOHHIWOCDSIKV0";
const STORAGE_URL = "https://remote-storage.developerakademie.org/item";

async function setItem(key, value) {
    // ("contactsRemote", contacts) or ("tasksRemote", tasks)  or ("currentUserName", nameAsObject)
    const payload = { key, value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, { method: "POST", body: JSON.stringify(payload) }).then((res) =>
        res.json()
    ); // response converted to JSON
}

async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    let erg = await fetch(url).then((res) => res.json());
    return erg; // Thus one can store erg in a variable
}