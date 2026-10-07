from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AuditRequest(BaseModel):
    school: str
    major: str
    completed: list[str]


def check_all_of(rule, completed):
    missing = [c for c in rule["courses"] if c not in completed]
    return {
        "name": rule["name"],
        "type": "all_of",
        "satisfied": len(missing) == 0,
        "missing": missing,
    }

def check_choose_n(rule, completed):
    pool = rule["courses"]
    count = len(set(pool) & set(completed))
    return {
        "name": rule["name"],
        "type": "choose_n",
        "satisfied": count >= rule["n"],
        "still_needed": max(0, rule["n"] - count),
        "options": [c for c in pool if c not in completed],
    }

def audit_major(rules, completed):
    results = []
    for rule in rules:
        if rule["type"] == "all_of":
            results.append(check_all_of(rule, completed))
        elif rule["type"] == "choose_n":
            results.append(check_choose_n(rule, completed))
        else:
            results.append({"name": rule.get("name", "Unknown"),
                            "type": "unknown", "satisfied": False})
    return results


schools = {
    "UC Irvine": {
        "Computer Science B.S": [
            {
                "type": "all_of",
                "name": "Lower-Division Core",
                "courses": ["I&C SCI 31", "I&C SCI 32", "I&C SCI 33", "I&C SCI 45C",
                            "I&C SCI 46", "I&C SCI 51", "I&C SCI 53", "SWE 43",
                            "MATH 2A", "MATH 2B", "I&C SCI 6B", "I&C SCI 6D", "STATS 67"],
            },
            {
                "type": "all_of",
                "name": "Upper-Division Core",
                "courses": ["COMPSCI 161", "I&C SCI 139W"],
            },
            {
                "type": "choose_n",
                "name": "Flexible Core",
                "n": 4,
                "courses": ["COMPSCI 112", "COMPSCI 116", "COMPSCI 121", "COMPSCI 122A",
                            "COMPSCI 130", "COMPSCI 132", "COMPSCI 134", "COMPSCI 141",
                            "COMPSCI 142A", "COMPSCI 143A", "COMPSCI 145", "COMPSCI 151",
                            "COMPSCI 152", "COMPSCI 162", "COMPSCI 171", "COMPSCI 178"],
            },
        ],
        "Biological Sciences B.S": [
            {
                "type": "all_of",
                "name": "Biological Sciences Core",
                "courses": ["BIO SCI 93", "BIO SCI 94", "BIO SCI 97", "BIO SCI 98", "BIO SCI 99",
                            "CHEM 1A", "CHEM 1B", "CHEM 1C", "CHEM 51A", "CHEM 51B", "CHEM 51C"],
            },
        ],
        "Psychological Science B.S": [
            {
                "type": "all_of",
                "name": "Psychology Fundamentals",
                "courses": ["PSCI 11A", "PSCI 11B", "PSCI 11C"],
            },
        ],
    },
    "UCLA": {
        "Computer Science B.S": [
            {
                "type": "all_of",
                "name": "Required Courses",
                "courses": ["COM SCI 1", "COM SCI 31", "COM SCI 32", "COM SCI 33", "COM SCI 35L",
                            "COM SCI M51A", "MATH 31A", "MATH 31B", "MATH 32A", "MATH 32B",
                            "MATH 33A", "MATH 33B", "MATH 61", "PHYSICS 1A", "PHYSICS 1B",
                            "PHYSICS 1C", "COM SCI 111", "COM SCI 118", "COM SCI 131",
                            "COM SCI M151B", "COM SCI M152A", "COM SCI 180", "COM SCI 181"],
            },
        ],
    },
    "UC Berkeley": {
        "Computer Science B.A": [
            {
                "type": "all_of",
                "name": "Lower-Division Core",
                "courses": ["MATH 51", "MATH 52", "COMPSCI 61A", "COMPSCI 61B",
                            "COMPSCI 61C", "COMPSCI 70"],
            },
        ],
    },
    "UC San Diego": {
        "Computer Science B.S": [
            {
                "type": "all_of",
                "name": "Lower-Division Core",
                "courses": ["CSE 12", "CSE 20", "CSE 21", "CSE 30",
                            "MATH 20A", "MATH 20B", "MATH 20C", "MATH 18"],
            },
        ],
    },
    "UC Davis": {
        "Computer Science B.S": [
            {
                "type": "all_of",
                "name": "Lower-Division Core",
                "courses": ["ECS 20", "ECS 32B", "ECS 32C", "ECS 34", "ECS 50",
                            "MAT 21A", "MAT 21B", "MAT 21C", "ECS 154A"],
            },
        ],
    },
    "UC Santa Barbara": {
        "Computer Science B.S": [
            {
                "type": "all_of",
                "name": "Lower-Division Core",
                "courses": ["CMPSC 16", "CMPSC 24", "CMPSC 40", "CMPSC 64",
                            "MATH 3A", "MATH 3B", "MATH 4A", "MATH 4B"],
            },
        ],
    },
    "UC Santa Cruz": {
        "Computer Science B.S": [
            {
                "type": "all_of",
                "name": "Core Courses",
                "courses": ["CSE 12", "CSE 13S", "CSE 16", "CSE 20", "CSE 30", "CSE 101"],
            },
        ],
    },
    "UC Riverside": {
        "Computer Science B.S": [
            {
                "type": "all_of",
                "name": "Core Courses",
                "courses": ["MATH 9A", "MATH 9B", "MATH 9C", "CS 10A", "CS 10B", "CS 11",
                            "CS 61", "CS 100", "CS 111", "CS 120A", "CS 161"],
            },
        ],
    },
    "UC Merced": {
        "Computer Science and Engineering B.S": [
            {
                "type": "all_of",
                "name": "Core Courses",
                "courses": ["CSE 020", "CSE 021", "CSE 030", "CSE 031", "CSE 100",
                            "MATH 021", "MATH 022", "MATH 023", "MATH 024", "MATH 032",
                            "PHYS 008", "PHYS 009"],
            },
        ],
    },
}


@app.post("/audit")
def run_audit(req: AuditRequest):
    if req.school not in schools:
        raise HTTPException(status_code=404, detail=f"School '{req.school}' not found")
    if req.major not in schools[req.school]:
        raise HTTPException(status_code=404, detail=f"Major '{req.major}' not found at {req.school}")

    rules = schools[req.school][req.major]
    return audit_major(rules, req.completed)

@app.get("/courses")
def get_courses(school: str, major: str):
    if school not in schools:
        raise HTTPException(status_code=404, detail=f"School '{school}' not found")
    if major not in schools[school]:
        raise HTTPException(status_code=404, detail=f"Major '{major}' not found")

    rules = schools[school][major]
    all_courses = []
    for rule in rules:
        for c in rule["courses"]:
            if c not in all_courses:
                all_courses.append(c)
    return all_courses