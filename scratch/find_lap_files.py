import os

print("Searching for LAP Excel files...")
for root, dirs, files in os.walk("."):
    # skip node_modules and .next directories
    if "node_modules" in root or ".next" in root or ".git" in root:
        continue
    for file in files:
        if "lap" in file.lower() and (file.endswith(".xlsx") or file.endswith(".xls") or file.endswith(".csv")):
            print(f"Found: {os.path.join(root, file)}")
