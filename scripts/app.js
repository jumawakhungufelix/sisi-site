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
  // Static variable to give every project a unique number ID (1, 2, 3...)
  static nextId = 1;

  // Rule: A getter that returns "National" without using brackets ()
  get level() {
    return "National";
  }

  constructor(title, budget) {
    this.id = Project.nextId;
    Project.nextId++; // Increment so the next project gets the next number

    this.title = title;
    this.budget = budget;

    // Arrays to store our data
    this.votedCitizenIds = []; // Keeps track of who has already voted
    this.voteChoices = [];     // Keeps track of the actual choices ("support" or "oppose")
    this.feedbackList = [];    // Keeps track of written feedback
  }

  // METHOD: Say whether a given citizen has already voted (Returns true or false)
  hasVoted(citizen) {
    // Check if the citizen's ID exists inside our voted list array
    return this.votedCitizenIds.includes(citizen.id_no);
  }

  // METHOD: Accept a vote from a citizen
  acceptVote(citizen, choice) {
    // Rule: Any choice other than support or oppose is refused
    if (choice !== "support" && choice !== "oppose") {
      console.log(`Vote refused for ${citizen.name}: Choice must be 'support' or 'oppose'.`);
      return; // Stop running the function right here
    }

    // Rule: One vote per citizen. A second vote is refused.
    if (this.hasVoted(citizen)) {
      console.log(`Vote refused: ${citizen.name} has already voted on this project.`);
      return; // Stop running the function
    }

    // If they pass the rules, record their vote!
    this.votedCitizenIds.push(citizen.id_no); // Remember their ID so they can't vote again
    this.voteChoices.push(choice);             // Remember what they voted for
    console.log(`Vote successfully recorded for ${citizen.name}!`);
  }

  // METHOD: Accept feedback from a citizen
  acceptFeedback(citizen, message) {
    // Rule: Empty or blank feedback is refused
    if (message === "" || message.trim() === "") {
      console.log(`Feedback refused from ${citizen.name}: Message cannot be empty.`);
      return;
    }

    // Each entry remembers who wrote it
    let feedbackEntry = {
      authorId: citizen.id_no,
      authorName: citizen.name,
      text: message
    };

    this.feedbackList.push(feedbackEntry);
    console.log(`Feedback added from ${citizen.name}!`);
  }

  // METHOD: Report the total results
  reportResults() {
    let supportCount = 0;
    let opposeCount = 0;

    // Loop through our array of choices to count them up
    for (let i = 0; i < this.voteChoices.length; i++) {
      if (this.voteChoices[i] === "support") {
        supportCount++;
      } else if (this.voteChoices[i] === "oppose") {
        opposeCount++;
      }
    }

    let totalVotes = supportCount + opposeCount;
    let supportPercentage = "0%";

    // Rule: Calculate percentage only if there are votes, otherwise keep it 0%
    if (totalVotes > 0) {
      let calculation = (supportCount / totalVotes) * 100;
      supportPercentage = calculation + "%";
    }

    // Return the final numbers together as an object
    return {
      support: supportCount,
      oppose: opposeCount,
      percentage: supportPercentage
    };
  }
}

class CountyProject extends Project {
  // Rule: Override the getter to read the dynamic county name instead of "National"
  get level() {
    return `${this.county} County`;
  }

  constructor(title, budget, county) {
    // Check if the county is supported by reusing Part B's Citizen.supportedCounties static method
    if (!Citizen.supportedCounties(county)) {
      throw new Error(`County ${county} is not supported!`);
    }

    // super() calls the constructor of the parent Project class
    super(title, budget); 

    // Save the new, extra piece of information unique to a County Project
    this.county = county; 
  }

  // Rule: Override the acceptVote method to enforce the county rule first
  acceptVote(citizen, choice) {
    // New rule: Check if the citizen's county matches this project's county
    if (citizen.county !== this.county) {
      console.log(`Vote refused for ${citizen.name}: Only residents of ${this.county} County can vote.`);
      return; // Stop the function immediately
    }

    // Reuse the parent's voting rules (one-vote check & choice validation) without rewriting it
    super.acceptVote(citizen, choice);
  }
}

class Portal {
  constructor() {
    this.citizens = [];      // Array to store all registered Citizen objects
    this.projects = [];      // Array to store all Project and CountyProject objects
    this.currentUser = null; // Remembers who is currently logged in (Citizen object or null)
  }

  // METHOD: Register a citizen (the portal creates the Citizen object)
  registerCitizen(name, county) {
    try {
      const newCitizen = new Citizen(name, county);
      this.citizens.push(newCitizen);
      console.log(`Citizen ${name} successfully registered with ID ${newCitizen.id_no}!`);
      return newCitizen;
    } catch (error) {
      console.log(`Registration failed: ${error.message}`);
      return null;
    }
  }

  // METHOD: Remember who is currently logged in
  login(citizenId) {
    for (let i = 0; i < this.citizens.length; i++) {
      if (this.citizens[i].id_no === citizenId) {
        this.currentUser = this.citizens[i];
        console.log(`Successfully logged in as: ${this.currentUser.name} (${this.currentUser.county} County)`);
        return;
      }
    }
    console.log(`Login failed: No citizen found with ID ${citizenId}.`);
  }

  // METHOD: Logout utility
  logout() {
    this.currentUser = null;
    console.log("Logged out successfully.");
  }

  // METHOD: Add projects of either kind
  addProject(projectObject) {
    this.projects.push(projectObject);
    console.log(`Added Project: [ID ${projectObject.id}] "${projectObject.title}"`);
  }

  // METHOD: Find a project by its id
  findProjectById(projectId) {
    for (let i = 0; i < this.projects.length; i++) {
      if (this.projects[i].id === projectId) {
        return this.projects[i];
      }
    }
    return null; // Not found
  }

  // METHOD: List projects three ways
  listProjects(type) {
    const list = [];

    for (let i = 0; i < this.projects.length; i++) {
      const proj = this.projects[i];

      if (type === "all") {
        list.push(proj);
      } 
      else if (type === "national" && proj.level === "National") {
        list.push(proj);
      } 
      else if (type === "my county") {
        // If nobody is logged in, return an empty list
        if (!this.currentUser) {
          continue; 
        }
        // Match only county projects that belong to the logged-in citizen's county
        if (proj.level !== "National" && proj.county === this.currentUser.county) {
          list.push(proj);
        }
      }
    }
    return list;
  }

  // METHOD: Vote as the logged-in citizen, by project id
  voteOnProject(projectId, choice) {
    // Rule: Voting when nobody is logged in is refused
    if (!this.currentUser) {
      console.log("Vote refused: You must be logged in to vote!");
      return;
    }

    const project = this.findProjectById(projectId);
    if (!project) {
      console.log(`Vote refused: Project ID ${projectId} does not exist.`);
      return;
    }

    // Call the project's own method using the logged-in user object
    project.acceptVote(this.currentUser, choice);
  }

  // METHOD: Give feedback as the logged-in citizen, by project id
  submitFeedback(projectId, message) {
    if (!this.currentUser) {
      console.log("Feedback refused: You must be logged in to submit feedback!");
      return;
    }

    const project = this.findProjectById(projectId);
    if (!project) {
      console.log(`Feedback refused: Project ID ${projectId} does not exist.`);
      return;
    }

    project.acceptFeedback(this.currentUser, message);
  }

  // METHOD: Report the project with the highest support percentage
  reportHighestSupported() {
    if (this.projects.length === 0) return null;

    let bestProject = null;
    let highestPct = -1; // Start below 0% so any valid calculation beats it

    for (let i = 0; i < this.projects.length; i++) {
      const proj = this.projects[i];
      const results = proj.reportResults(); // Object containing { support, oppose, percentage }
      
      // Convert "66.7%" string into a float number like 66.7
      const currentPct = parseFloat(results.percentage); 

      if (currentPct > highestPct) {
        highestPct = currentPct;
        bestProject = proj;
      }
    }

    return bestProject;
  }
}



// Test cases and Run
// 1.1 Create the citizens using your Citizen class
const C1 = new Citizen('Wanjiku', 'Nairobi');
const C2 = new Citizen('Felix', 'Nairobi');
const C3 = new Citizen('Mwangi', 'Kiambu');

// 1.2. Create a National Project
const expressway = new Project("Nairobi Expressway", "KSh 50B");

console.log(`Project Level: ${expressway.level}`); // Prints: National

// 1.3. Testing Votes
expressway.acceptVote(C1, "support"); // Success!
expressway.acceptVote(C2, "oppose");  // Success!

// Rule Test: Trying to vote a second time
expressway.acceptVote(C1, "oppose");  // Refused! Wanjiku already voted.

// Rule Test: Invalid choice
expressway.acceptVote(C3, "maybe");   // Refused! Must be support or oppose.

// 1.4. Testing Feedback
expressway.acceptFeedback(C1, "Saves a lot of travel time."); // Success!
expressway.acceptFeedback(C2, "   ");                        // Refused! Empty string.

// 1.5. Printing Final Results
console.log("--- FINAL RESULTS ---");
console.log(expressway.reportResults()); 
// Output: { support: 1, oppose: 1, percentage: "50%" }





// 2.1 Try creating a project in an unsupported county (Will crash as requested)
try {
  const badProject = new CountyProject("Mombasa Port Upgrade", "KSh 2B", "Nakuru");
} catch (error) {
  console.log(`Error Caught: ${error.message}`); // Output: County Nakuru is not supported!
}

// 2.2. Create a valid County Project for Nairobi
const roadUpgrade = new CountyProject("Nairobi Ring Road Phase 1", "KSh 5B", "Nairobi");

// Verify the Getter rule
console.log(`Project Level: ${roadUpgrade.level}`); // Output: Nairobi County
console.log(`Project ID: ${roadUpgrade.id}`);       // Output: 2 (Auto-incremented from Project class)

console.log("\n--- Voting Phase ---");

// Test Rule: Valid matching resident votes
roadUpgrade.acceptVote(C1, "support"); // Output: Vote successfully recorded for Wanjiku!

// Test Rule: Citizen from a DIFFERENT county tries to vote
roadUpgrade.acceptVote(C3, "support"); // Output: Vote refused for Mwangi: Only residents of Nairobi County can vote.

// Test Rule: Reusing the Parent's one-vote rule (Wanjiku tries to vote a second time)
roadUpgrade.acceptVote(C1, "oppose");  // Output: Vote refused: Wanjiku has already voted on this project.

console.log("\n--- Final Results ---");
console.log(roadUpgrade.reportResults()); // Output: { support: 1, oppose: 0, percentage: "100%" }



// ==================== INITIAL PORTAL SETUP ====================
const sisiApp = new Portal();

// 1. Add your projects...
sisiApp.addProject(new Project("Affordable Housing Phase 3", "KSh 5,000,000,000"));
sisiApp.addProject(new CountyProject("Market Upgrade", "KSh 120,000,000", "Nairobi"));
sisiApp.addProject(new CountyProject("Ferry Walkway", "KSh 80,000,000", "Mombasa"));
sisiApp.addProject(new CountyProject("Lakefront Street Lights", "KSh 45,000,000", "Kisumu"));

// 2. Register citizens and save their returned object references
const wanjiku = sisiApp.registerCitizen("Wanjiku", "Nairobi"); 
const ali = sisiApp.registerCitizen("Ali", "Mombasa");         

console.log("\n--- TESTING LISTING & LOGIN CONTROLS ---");


sisiApp.login(wanjiku.id_no); 


console.log("Wanjiku's county projects:", sisiApp.listProjects("my county").map(p => p.title));

console.log("\n--- TESTING VOTING & FEEDBACK RULES ---");


sisiApp.voteOnProject(1, "support"); 
sisiApp.voteOnProject(2, "support"); 
sisiApp.submitFeedback(1, "Housing is a basic human right!");


sisiApp.login(ali.id_no); 

sisiApp.voteOnProject(3, "support"); 
sisiApp.voteOnProject(1, "oppose");  

console.log("\n--- TESTING HIGHEST SUPPORT REPORT ---");
const winner = sisiApp.reportHighestSupported();
if (winner) {
  console.log(`Highest supported project: "${winner.title}" with a rating of ${winner.reportResults().percentage}`);
}
