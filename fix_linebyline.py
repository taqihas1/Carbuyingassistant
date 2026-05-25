import os

os.chdir('/Users/taqihasan/carbuyassistantgithub/Carbuyingassistant')

with open('src/screens/CarSearchScreen.tsx', 'r') as f:
    lines = f.readlines()

# FIX 1: selectedSearchRadius uses userLocation before declared
for i, line in enumerate(lines):
    if 'selectedSearchRadius' in line and 'userLocation' in line:
        lines[i] = '  const [selectedSearchRadius, setSelectedSearchRadius] = useState<number | null>(null);\n'
        print(f'Fixed line {i+1}: selectedSearchRadius initial value')
        break

# FIX 2: Move selectedSearchRadius chip OUT of zipCode block
for i, line in enumerate(lines):
    if '{zipCode && (' in line and i > 200:
        # Find where selectedSearchRadius block starts inside zipCode
        for j in range(i, min(i + 20, len(lines))):
            if '{selectedSearchRadius && (' in lines[j]:
                # Find where this block ends
                for sr_end in range(j + 1, min(j + 15, len(lines))):
                    if ')}' in lines[sr_end]:
                        # Extract the selectedSearchRadius block
                        sr_block = lines[j:sr_end]
                        # Remove it from inside zipCode
                        lines[j:sr_end] = []
                        # Insert after zipCode block closes
                        # After removal, sr_end position shifted, find the new zipCode close
                        for zip_close in range(j, min(j + 5, len(lines))):
                            if ')}' in lines[zip_close]:
                                insert_pos = zip_close + 1
                                sr_block.insert(0, '\n')
                                lines[insert_pos:insert_pos] = sr_block
                                print(f'Fixed: moved selectedSearchRadius out of zipCode block')
                                break
                        break
                break
        break

# FIX 3: useEffect dependency array
for i, line in enumerate(lines):
    if '}, []);' in line and i > 70 and i < 90:
        lines[i] = lines[i].replace('}, []);', '}, [loadListings]);')
        print(f'Fixed line {i+1}: useEffect deps')
        break

# FIX 4: returnKeyType
for i, line in enumerate(lines):
    if 'returnKeyType="done"' in line:
        lines[i] = line.replace('returnKeyType="done"', 'returnKeyType="search"')
        print(f'Fixed line {i+1}: returnKeyType')
        break

with open('src/screens/CarSearchScreen.tsx', 'w') as f:
    f.writelines(lines)

print('Done! All fixes applied.')
