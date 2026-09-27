from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException 

class AuditRequest(BaseModel):
    school: str
    major: str
    completed: list[str]

app = FastAPI()

def audit(requirements, completed):    
    missing = []
    for n in requirements:
        if n not in completed:
           missing.append(n)
    return missing

schools = {
    "UC Irvine": {
        "Computer Science B.S": [
            "I&C SCI 31", "I&C SCI 32", "I&C SCI 33",
            "I&C SCI 45C", "I&C SCI 46", "I&C SCI 51", "I&C SCI 53",
            "SWE 43", "MATH 2A", "MATH 2B",
            "I&C SCI 6B", "I&C SCI 6D", "STATS 67",
            "COMPSCI 161", "I&C SCI 139W",
        ],
    },
        "UCLA": {
        
        "Computer Science B.S": [
            "COM SCI 1", "COM SCI 31", "COM SCI 32", "COM SCI 33", "COM SCI 35L", "COM SCI M51A",
            "MATH 31A", "MATH 31B", "MATH 32A", "MATH 32B", "MATH 33A", "MATH 33B", "MATH 61",
            "PHYSICS 1A", "PHYSICS 1B", "PHYSICS 1C",
            "COM SCI 111", "COM SCI 118", "COM SCI 131",
            "COM SCI M151B", "COM SCI M152A", "COM SCI 180", "COM SCI 181",
        ],
    },
}




@app.post("/audit")
def run_audit(req: AuditRequest):
    if req.school not in schools:
        raise HTTPException(status_code=404, detail=f"School '{req.school}' not found")
    if req.major not in schools[req.school]:
        raise HTTPException(status_code=404, detail=f"Major '{req.major}' not found at {req.school}")

    requirements = schools[req.school][req.major]
    return audit(requirements, req.completed)