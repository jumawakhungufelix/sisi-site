class Citizen {
    static nextId = 100;
    static registeredCitizens = 0;
    static supported = ['Nairobi', 'Mombasa', 'Kisumu', 'Kiambu'];

    static supportedCounties(county) {
        return Citizen.supported.includes(county);
    }

    constructor(name, county) {
        if (!Citizen.supportedCounties(county)) {
            throw new Error(`County ${county} not available`);
        }
        this.id_no = Citizen.nextId++;
        this.name = name;
        this.county = county;

        Citizen.registeredCitizens++;
    }

    describe() {
        console.log(`ID: ${this.id_no}. ${this.name} from ${this.county}`);
    }
}

class Project {
    static nextId = 1;
    
    // Encapsulated collections to track records per project instance
    #votes = new Map();         // Maps citizen ID -> 'support' or 'oppose'
    #feedbackList = [];        // Stores feedback objects { citizenId, text }

    constructor(title, budget) {
        this.id = Project.nextId++;
        this.title = title;
        this.budget = budget; // Budget in KSh
    }

    // Rule 1 & 2: Accept a vote from a citizen. One vote per citizen. Refuse invalid choices.
    acceptVote(citizen, choice) {
        if (!choice || typeof choice !== 'string') return false;
        
        const normalizedChoice = choice.trim().toLowerCase();
        
        // Ensure choice is strictly support or oppose
        if (normalizedChoice !== 'support' && normalizedChoice !== 'oppose') {
            console.log(`Vote rejected: '${choice}' is an invalid choice.`);
            return false;
        }

        // Prevent duplicate voting per citizen
        if (this.#votes.has(citizen.id_no)) {
            console.log(`Vote rejected: Citizen ID ${citizen.id_no} has already voted.`);
            return false;
        }

        this.#votes.set(citizen.id_no, normalizedChoice);
        return true;
    }

    // Rule 3: Say whether a given citizen has voted (returns true or false)
    hasVoted(citizen) {
        return this.#votes.has(citizen.id_no);
    }

    // Rule 4: Accept feedback from a citizen. Empty/blank is refused. Remember author.
    acceptFeedback(citizen, feedbackText) {
        if (!feedbackText || !feedbackText.trim()) {
            console.log("Feedback rejected: Message cannot be empty or blank.");
            return false;
        }

        this.#feedbackList.push({
            citizenId: citizen.id_no,
            text: feedbackText.trim()
        });
        return true;
    }

    // Rule 5: Report support count, oppose count, and percentage
    reportResults() {
        let supportCount = 0;
        let opposeCount = 0;

        for (const choice of this.#votes.values()) {
            if (choice === 'support') supportCount++;
            if (choice === 'oppose') opposeCount++;
        }

        const totalVotes = supportCount + opposeCount;
        const supportPercentage = totalVotes > 0 
            ? ((supportCount / totalVotes) * 100).toFixed(1) + '%' 
            : '0%';

        return {
            supportCount,
            opposeCount,
            supportPercentage
        };
    }

    // Rule 6: Getter that reads like a property and returns "National"
    get level() {
        return "National";
    }
}

class CountyProject extends Project {
    // Encapsulated private field for the county
    #county;

    constructor(title, budget, county) {
        // Reuse Part B validation: verify if the county is supported by the Citizen class
        if (!Citizen.supportedCounties(county)) {
            throw new Error(`County ${county} is not a supported county.`);
        }
        
        // Call the parent Project constructor using super
        super(title, budget);
        this.#county = county;
    }

    /**
     * Overrides the level getter. 
     * Reads like a property and returns "[County Name] County".
     */
    get level() {
        return `${this.#county} County`;
    }

    /**
     * Overrides the acceptVote method to enforce the new regional restriction.
     * Reuses the parent's logic for single voting via super.
     */
    acceptVote(citizen, choice) {
        // New Rule: Only citizens registered in this project's county may vote
        if (citizen.county !== this.#county) {
            console.log(`Vote rejected: ${citizen.name} belongs to ${citizen.county}, but this project is for ${this.#county} County.`);
            return false;
        }

        // Reuse the parent's one-vote and valid choice rules using super
        return super.acceptVote(citizen, choice);
    }
}

// ==================== TEST DRIVER EXECUTIONS ====================

// 1. Register citizens
const C1 = new Citizen('Wanjiku', 'Nairobi');
const C2 = new Citizen('Felix', 'Nairobi');
C1.describe();
C2.describe();
console.log(`Total registered citizens: ${Citizen.registeredCitizens}\n`);

// 2. Create a National Project
const expressway = new Project('Nairobi Expressway Phase 2', 5000000);
console.log(`Project Created: ID ${expressway.id} - ${expressway.title} (Level: ${expressway.level})`);

// 3. Test Voting Rules
expressway.acceptVote(C1, 'support'); // Valid vote
expressway.acceptVote(C1, 'oppose');  // Duplicate vote (Refused)
expressway.acceptVote(C2, 'maybe');   // Invalid choice (Refused)
expressway.acceptVote(C2, 'oppose');  // Valid vote

// 4. Test Verification Rule
console.log(`Has Wanjiku voted? ${expressway.hasVoted(C1)}`); 

// 5. Test Feedback Rules
expressway.acceptFeedback(C1, 'This will ease traffic immensely!'); // Valid feedback
expressway.acceptFeedback(C2, '   '); // Blank feedback (Refused)

// 6. Report Results
console.log("\n--- Final Project Results ---");
console.log(expressway.reportResults());

//Section D
// 1. Setup Citizens from different counties
const nairobiCitizen = new Citizen('Amina', 'Nairobi');
const kisumuCitizen = new Citizen('Ochieng', 'Kisumu');

// 2. Instantiate a County Project (Threw error if county was invalid like 'Nakuru')
const stadiumProject = new CountyProject('Kisumu Stadium Renovation', 2500000, 'Kisumu');
console.log(`Project Created: ID ${stadiumProject.id} - ${stadiumProject.title}`);
console.log(`Project Level: ${stadiumProject.level}\n`); // Reads without brackets

// 3. Test Regional Voting Rule (Amina from Nairobi tries to vote on a Kisumu project)
stadiumProject.acceptVote(nairobiCitizen, 'support'); 

// 4. Test Valid Regional Voting (Ochieng from Kisumu votes)
stadiumProject.acceptVote(kisumuCitizen, 'support');

// 5. Test Parent Rule Re-use (Ochieng tries to vote a second time)
stadiumProject.acceptVote(kisumuCitizen, 'oppose'); 

// 6. Report Results
console.log("\n--- County Project Results ---");
console.log(stadiumProject.reportResults());


class Portal {
    // Encapsulated collections using maps and arrays
    #citizens = new Map();     // Maps citizen ID -> Citizen object
    #projects = new Map();     // Maps project ID -> Project/CountyProject object
    #loggedInCitizen = null;   // Keeps track of the active user session

    /**
     * Registers a new citizen through the portal, creates the object, and saves it.
     */
    registerCitizen(name, county) {
        try {
            const newCitizen = new Citizen(name, county);
            this.#citizens.set(newCitizen.id_no, newCitizen);
            return newCitizen;
        } catch (error) {
            console.log(`Registration Failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Simulates logging in a citizen using their registration ID number.
     */
    login(citizenId) {
        if (this.#citizens.has(citizenId)) {
            this.#loggedInCitizen = this.#citizens.get(citizenId);
            console.log(`Session Active: ${this.#loggedInCitizen.name} logged in.`);
            return true;
        }
        console.log(`Login Failed: Citizen ID ${citizenId} not found.`);
        return false;
    }

    /**
     * Logs out the current user session.
     */
    logout() {
        this.#loggedInCitizen = null;
        console.log("Logged out successfully.");
    }

    /**
     * Adds an existing Project or CountyProject instance to the system.
     */
    addProject(project) {
        this.#projects.set(project.id, project);
    }

    /**
     * Finds and returns a project by its unique numeric ID.
     */
    findProjectById(projectId) {
        return this.#projects.get(projectId) || null;
    }

    /**
     * Lists projects matching dynamic filters.
     * Mode options: 'all', 'national', 'my_county'
     */
    listProjects(mode = 'all') {
        const allProjects = Array.from(this.#projects.values());

        if (mode === 'national') {
            return allProjects.filter(p => p.level === "National");
        }

        if (mode === 'my_county') {
            if (!this.#loggedInCitizen) {
                return []; // Rule: Empty list if nobody is logged in
            }
            // Checks if project is a CountyProject (level will include "County")
            // and compares it directly with the logged-in user's regional criteria
            return allProjects.filter(p => p.level === `${this.#loggedInCitizen.county} County`);
        }

        return allProjects; // Default: 'all'
    }

    /**
     * Casts a vote for a project on behalf of the logged-in citizen.
     */
    voteOnProject(projectId, choice) {
        // Rule: Voting when nobody is logged in is refused.
        if (!this.#loggedInCitizen) {
            console.log("Action Refused: You must be logged in to vote.");
            return false;
        }

        const project = this.findProjectById(projectId);
        if (!project) {
            console.log(`Action Refused: Project ID ${projectId} does not exist.`);
            return false;
        }

        return project.acceptVote(this.#loggedInCitizen, choice);
    }

    /**
     * Submits feedback for a project on behalf of the logged-in citizen.
     */
    submitFeedback(projectId, text) {
        if (!this.#loggedInCitizen) {
            console.log("Action Refused: You must be logged in to submit feedback.");
            return false;
        }

        const project = this.findProjectById(projectId);
        if (!project) {
            console.log(`Action Refused: Project ID ${projectId} does not exist.`);
            return false;
        }

        return project.acceptFeedback(this.#loggedInCitizen, text);
    }

    /**
     * Analyzes and reports the project with the highest support percentage.
     */
    reportHighestSupported() {
        if (this.#projects.size === 0) return null;

        let highestProject = null;
        let highestPercentage = -1;

        for (const project of this.#projects.values()) {
            const results = project.reportResults();
            // Parse numerical float from string value format (e.g. "85.5%" -> 85.5)
            const percentage = parseFloat(results.supportPercentage);

            if (percentage > highestPercentage) {
                highestPercentage = percentage;
                highestProject = project;
            }
        }

        return highestProject;
    }
}

// ==================== SEED DATA & TEST EXECUTION ====================

// 1. Initialize the Portal
const sisiApp = new Portal();

// 2. Load Fictional Test Data
const p1 = new Project('Affordable Housing Phase 3', 5000000000);
const p2 = new CountyProject('Market Upgrade', 120000000, 'Nairobi');
const p3 = new CountyProject('Ferry Walkway', 80000000, 'Mombasa');
const p4 = new CountyProject('Lakefront Street Lights', 45000000, 'Kisumu');

sisiApp.addProject(p1);
sisiApp.addProject(p2);
sisiApp.addProject(p3);
sisiApp.addProject(p4);

// 3. Register Citizens across different regions
const c1 = sisiApp.registerCitizen('Amina', 'Nairobi');
const c2 = sisiApp.registerCitizen('Juma', 'Mombasa');

console.log("--- Initial Application State ---");
console.log(`Total Projects Loaded: ${sisiApp.listProjects('all').length}`);

// 4. Test filtering actions when logged out
console.log(`'my county' project count when logged out: ${sisiApp.listProjects('my_county').length}`);

// 5. Test session handling and execution rules
sisiApp.login(c1.id_no); // Amina from Nairobi logs in

console.log("\n--- Filtering Projects for Amina (Nairobi) ---");
console.log("My County Projects:", sisiApp.listProjects('my_county').map(p => p.title));
console.log("National Projects:", sisiApp.listProjects('national').map(p => p.title));

// 6. Test interaction engine rules
sisiApp.voteOnProject(p1.id, 'support'); // Amina votes on National project (Success)
sisiApp.voteOnProject(p2.id, 'support'); // Amina votes on Nairobi project (Success)
sisiApp.voteOnProject(p3.id, 'support'); // Amina tries to vote on Mombasa project (Fails regional rule)
sisiApp.submitFeedback(p1.id, 'Great step towards home ownership.');

sisiApp.logout();

// 7. Verify analytics metrics
sisiApp.login(c2.id_no); // Juma from Mombasa logs in
sisiApp.voteOnProject(p1.id, 'oppose'); // Juma opposes housing project (Ties percentage)
sisiApp.voteOnProject(p3.id, 'support'); // Juma supports Mombasa walkway (100% support)

console.log("\n--- Global Analytics Performance ---");
const starProject = sisiApp.reportHighestSupported();
console.log(`Highest Supported Project: "${starProject.title}" with standard results:`, starProject.reportResults());

