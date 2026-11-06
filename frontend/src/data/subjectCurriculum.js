/**
 * EduInsight AI - Comprehensive Subject Curriculum & Question Bank
 * Provides 20 curated questions for each topic across all subjects:
 * - Mathematics
 * - Science
 * - English
 * - Computer Science
 */

export const SUBJECT_CURRICULUM = {
  // =========================================================================
  // 1. SCIENCE
  // =========================================================================
  Science: {
    name: 'Science',
    description: 'Explore the natural and physical world through biological systems, chemical reactions, forces, and energy dynamics.',
    topics: [
      {
        id: 'sci_cell_bio',
        name: 'Cell Biology & Genetics',
        description: 'Organelle functions, mitosis, meiosis, DNA structure, and Mendelian inheritance.',
        difficulty: 'Medium',
        duration: 20, // 20 minutes for 20 questions
        questions: [
          { q: 'Which organelle is known as the powerhouse of the cell?', a: 'Nucleus', b: 'Mitochondria', c: 'Ribosome', d: 'Endoplasmic Reticulum', correct: 'B', hint: 'It produces ATP through cellular respiration.' },
          { q: 'Which organelle contains digestive enzymes to break down waste?', a: 'Lysosome', b: 'Golgi Apparatus', c: 'Vacuole', d: 'Chloroplast', correct: 'A', hint: 'Often called the cellular suicide bag.' },
          { q: 'What is the primary function of ribosomes in a cell?', a: 'Lipid synthesis', b: 'Protein synthesis', c: 'DNA replication', d: 'Cell motility', correct: 'B', hint: 'They translate mRNA into polypeptide chains.' },
          { q: 'Which molecule carries genetic information from the nucleus to the ribosome?', a: 'tRNA', b: 'mRNA', c: 'rRNA', d: 'DNA polymerase', correct: 'B', hint: 'The "m" stands for messenger.' },
          { q: 'In plant cells, which structure provides rigidity and structural support?', a: 'Plasma membrane', b: 'Cell wall', c: 'Tonoplast', d: 'Cytoplasm', correct: 'B', hint: 'Made primarily of cellulose fibers.' },
          { q: 'During which phase of mitosis do sister chromatids separate to opposite poles?', a: 'Prophase', b: 'Metaphase', c: 'Anaphase', d: 'Telophase', correct: 'C', hint: 'Chromatids are pulled "Away".' },
          { q: 'How many chromosomes are present in a normal human somatic cell?', a: '23', b: '46', c: '48', d: '92', correct: 'B', hint: '23 pairs of chromosomes.' },
          { q: 'Which base pairs with Adenine in a double-stranded DNA molecule?', a: 'Cytosine', b: 'Guanine', c: 'Thymine', d: 'Uracil', correct: 'C', hint: 'A pairs with T in DNA.' },
          { q: 'What process do gametes (sperm and egg cells) undergo to divide?', a: 'Mitosis', b: 'Meiosis', c: 'Binary fission', d: 'Budding', correct: 'B', hint: 'A reduction division resulting in haploid cells.' },
          { q: 'What is an alternative form of a specific gene called?', a: 'Codon', b: 'Allele', c: 'Locus', d: 'Genome', correct: 'B', hint: 'For example, dominant (T) or recessive (t).' },
          { q: 'Which organelle packages and modifies proteins for secretion?', a: 'Golgi apparatus', b: 'Peroxisome', c: 'Centrosome', d: 'Smooth ER', correct: 'A', hint: 'Discovered by Camillo Golgi in 1898.' },
          { q: 'What pigment in chloroplasts absorbs light energy for photosynthesis?', a: 'Carotenoid', b: 'Anthocyanin', c: 'Chlorophyll', d: 'Melanin', correct: 'C', hint: 'Gives leaves their vibrant green color.' },
          { q: 'In RNA, which nitrogenous base replaces Thymine?', a: 'Cytosine', b: 'Uracil', c: 'Adenine', d: 'Guanine', correct: 'B', hint: 'Represented by the single letter U.' },
          { q: 'What is the genotype of an organism with two identical alleles for a trait?', a: 'Heterozygous', b: 'Homozygous', c: 'Hemizygous', d: 'Polygenic', correct: 'B', hint: 'Prefix "homo-" means same.' },
          { q: 'Which scientist is celebrated as the Father of Modern Genetics?', a: 'Charles Darwin', b: 'Gregor Mendel', c: 'Louis Pasteur', d: 'James Watson', correct: 'B', hint: 'Conducted famous hybridization experiments on pea plants.' },
          { q: 'What is the semi-fluid substance that fills the cell and suspends organelles?', a: 'Cytosol/Cytoplasm', b: 'Nucleoplasm', c: 'Extracellular matrix', d: 'Vacuolar sap', correct: 'A', hint: 'Composed mostly of water, salts, and proteins.' },
          { q: 'Which cellular transport mechanism requires metabolic energy (ATP)?', a: 'Simple diffusion', b: 'Facilitated diffusion', c: 'Active transport', d: 'Osmosis', correct: 'C', hint: 'Pumps molecules against their concentration gradient.' },
          { q: 'What type of bond holds together the two complementary strands of DNA?', a: 'Covalent bonds', b: 'Hydrogen bonds', c: 'Ionic bonds', d: 'Peptide bonds', correct: 'B', hint: 'Weak intermolecular attractions between base pairs.' },
          { q: 'What is the term for a permanent alteration in the DNA sequence of an organism?', a: 'Translation', b: 'Transcription', c: 'Mutation', d: 'Recombination', correct: 'C', hint: 'Can be silent, beneficial, or harmful.' },
          { q: 'Which cellular structure regulates what enters and exits the cell?', a: 'Cell membrane', b: 'Nuclear pore', c: 'Microtubule', d: 'Endosome', correct: 'A', hint: 'Phospholipid bilayer with selective permeability.' }
        ]
      },
      {
        id: 'sci_chem_rxn',
        name: 'Chemical Reactions & Equations',
        description: 'Types of reactions, oxidation-reduction, stoichiometry, balancing, and rate factors.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'What is the product formed when magnesium ribbon burns in oxygen?', a: 'Magnesium chloride', b: 'Magnesium oxide', c: 'Magnesium nitride', d: 'Magnesium carbonate', correct: 'B', hint: 'A brilliant white light producing white powder MgO.' },
          { q: 'In the reaction 2H₂ + O₂ → 2H₂O, what type of reaction is this?', a: 'Decomposition', b: 'Combination/Synthesis', c: 'Displacement', d: 'Neutralization', correct: 'B', hint: 'Two reactants join to form a single compound.' },
          { q: 'What gas is evolved when zinc granules react with dilute hydrochloric acid?', a: 'Oxygen', b: 'Hydrogen', c: 'Chlorine', d: 'Carbon dioxide', correct: 'B', hint: 'Burns with a characteristic "pop" sound.' },
          { q: 'Which law requires all chemical equations to be balanced?', a: 'Law of Conservation of Mass', b: 'Law of Multiple Proportions', c: 'Avogadro’s Law', d: 'Boyle’s Law', correct: 'A', hint: 'Mass cannot be created or destroyed in a chemical reaction.' },
          { q: 'What happens in an exothermic reaction?', a: 'Heat is absorbed', b: 'Heat is released', c: 'Temperature drops', d: 'No energy transfer', correct: 'B', hint: 'Prefix "exo-" means outward.' },
          { q: 'What is the oxidation state of sulfur in H₂SO₄?', a: '+2', b: '+4', b: '+4', c: '+6', d: '-2', correct: 'C', hint: 'H is +1 each, O is -2 each (total -8 + 2 = -6).' },
          { q: 'Which substance acts as a catalyst in the decomposition of hydrogen peroxide?', a: 'Manganese dioxide (MnO₂)', b: 'Sodium chloride', c: 'Calcium carbonate', d: 'Iron oxide', correct: 'A', hint: 'Black powder that dramatically speeds up O₂ gas evolution.' },
          { q: 'What type of reaction is CaCO₃ → CaO + CO₂ under heat?', a: 'Thermal decomposition', b: 'Electrolytic decomposition', c: 'Double displacement', d: 'Redox', correct: 'A', hint: 'Heat breaks down limestone into quicklime and gas.' },
          { q: 'What is the term for a reaction where oxidation and reduction occur simultaneously?', a: 'Combustion', b: 'Redox reaction', c: 'Precipitation', d: 'Neutralization', correct: 'B', hint: 'Short for reduction-oxidation.' },
          { q: 'What color precipitate forms when lead nitrate reacts with potassium iodide?', a: 'White', b: 'Bright Yellow', c: 'Blue', d: 'Brown', correct: 'B', hint: 'Lead iodide (PbI₂) is a famous bright yellow precipitate.' },
          { q: 'What is the pH of a completely neutral aqueous solution at 25°C?', a: '0', b: '7', c: '14', d: '1', correct: 'B', hint: 'Pure water has this pH.' },
          { q: 'Which of the following represents a double displacement reaction?', a: '2Mg + O₂ → 2MgO', b: 'AgNO₃ + NaCl → AgCl + NaNO₃', c: 'Zn + CuSO₄ → ZnSO₄ + Cu', d: '2H₂O → 2H₂ + O₂', correct: 'B', hint: 'Two ionic compounds exchange their positive and negative ions.' },
          { q: 'What happens to the rate of most chemical reactions when temperature is increased?', a: 'Decreases', b: 'Increases', c: 'Remains identical', d: 'Drops to zero', correct: 'B', hint: 'Higher kinetic energy increases frequency of effective collisions.' },
          { q: 'Which gas is released during photosynthesis?', a: 'Carbon dioxide', b: 'Oxygen', c: 'Nitrogen', d: 'Methane', correct: 'B', hint: 'Crucial byproduct required for aerobic cellular respiration.' },
          { q: 'What is the chemical formula for rust on iron?', a: 'Fe₂O₃·xH₂O', b: 'FeO', c: 'Fe(OH)₂', d: 'FeCl₃', correct: 'A', hint: 'Hydrated iron(III) oxide formed in the presence of air and moisture.' },
          { q: 'An acid turns blue litmus paper to which color?', a: 'Green', b: 'Red', c: 'Yellow', d: 'Purple', correct: 'B', hint: 'Acids turn litmus red; bases turn litmus blue.' },
          { q: 'What is the term for the substance that is consumed completely first in a reaction?', a: 'Excess reagent', b: 'Limiting reagent', c: 'Catalyst', d: 'Intermediate', correct: 'B', hint: 'Limits the maximum amount of product that can be formed.' },
          { q: 'Which acid is naturally found in vinegar?', a: 'Citric acid', b: 'Acetic acid (Ethanoic acid)', c: 'Formic acid', d: 'Lactic acid', correct: 'B', hint: 'CH₃COOH with a pungent smell.' },
          { q: 'What type of oxide is Carbon monoxide (CO)?', a: 'Acidic', b: 'Basic', c: 'Neutral', d: 'Amphoteric', correct: 'C', hint: 'Does not react with either acids or bases.' },
          { q: 'What is the process of coating iron with a layer of zinc called?', a: 'Galvanization', b: 'Electroplating', c: 'Anodizing', d: 'Smelting', correct: 'A', hint: 'Prevents corrosion and rusting of steel.' }
        ]
      },
      {
        id: 'sci_motion_force',
        name: 'Newton’s Laws of Motion & Energy',
        description: 'Inertia, momentum, action-reaction pairs, gravity, kinetic and potential energy.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'Which of Newton’s laws is also known as the Law of Inertia?', a: 'First Law', b: 'Second Law', c: 'Third Law', d: 'Law of Gravitation', correct: 'A', hint: 'An object at rest stays at rest unless acted upon by an unbalanced force.' },
          { q: 'What is the SI unit of force?', a: 'Joule', b: 'Newton', c: 'Pascal', d: 'Watt', correct: 'B', hint: 'Equal to 1 kg·m/s².' },
          { q: 'What is the formula for calculating momentum (p)?', a: 'p = m · v', b: 'p = m / v', c: 'p = 0.5 m · v²', d: 'p = F · t²', correct: 'A', hint: 'Mass multiplied by velocity.' },
          { q: 'According to Newton’s Third Law, forces always occur in:', a: 'Single isolated events', b: 'Equal and opposite pairs', c: 'Unequal perpendicular pairs', d: 'Random magnitudes', correct: 'B', hint: 'To every action there is an equal and opposite reaction.' },
          { q: 'What is the acceleration due to gravity on the surface of the Earth approximately?', a: '9.8 m/s²', b: '8.9 m/s²', c: '10.5 m/s²', d: '1.6 m/s²', correct: 'A', hint: 'Denoted as "g" in free-fall kinematics.' },
          { q: 'What is the energy possessed by an object due to its motion called?', a: 'Potential energy', b: 'Kinetic energy', c: 'Chemical energy', d: 'Thermal energy', correct: 'B', hint: 'Calculated as ½ mv².' },
          { q: 'What is the formula for Gravitational Potential Energy near Earth’s surface?', a: 'PE = m · g · h', b: 'PE = m / h', c: 'PE = ½ m · v²', d: 'PE = F · d²', correct: 'A', hint: 'Mass × gravity × height.' },
          { q: 'What is the rate of doing work or transferring energy called?', a: 'Torque', b: 'Power', c: 'Momentum', d: 'Impulse', correct: 'B', hint: 'Measured in Watts (Joules per second).' },
          { q: 'If the net force acting on a moving object is zero, the object will:', a: 'Come to an immediate stop', b: 'Move with constant velocity', c: 'Accelerate continuously', d: 'Spin uncontrollably', correct: 'B', hint: 'Zero net force means zero acceleration.' },
          { q: 'What is the friction experienced by an object sliding over a surface called?', a: 'Static friction', b: 'Kinetic/Sliding friction', c: 'Rolling friction', d: 'Fluid friction', correct: 'B', hint: 'Friction between surfaces in relative motion.' },
          { q: 'Which has greater inertia: a 50 kg boulder or a 5 kg bowling ball?', a: 'The 5 kg bowling ball', b: 'The 50 kg boulder', c: 'Both have identical inertia', d: 'Depends on velocity', correct: 'B', hint: 'Inertia is directly proportional to mass.' },
          { q: 'What is the area under a force-time graph equal to?', a: 'Work done', b: 'Impulse (change in momentum)', c: 'Acceleration', d: 'Power', correct: 'B', hint: 'Force multiplied by time interval Δt.' },
          { q: 'What type of collision conserves both momentum and kinetic energy?', a: 'Inelastic collision', b: 'Elastic collision', c: 'Explosive collision', d: 'Plastic collision', correct: 'B', hint: 'No kinetic energy is lost as heat or sound.' },
          { q: 'What is the work done when a force of 10 N moves a box 5 meters in its direction?', a: '2 Joules', b: '15 Joules', c: '50 Joules', d: '500 Joules', correct: 'C', hint: 'Work = Force × Displacement = 10 × 5.' },
          { q: 'What is the universal gravitational constant G approximately equal to?', a: '6.67 × 10⁻¹¹ N·m²/kg²', b: '9.8 m/s²', c: '3.0 × 10⁸ m/s', d: '1.6 × 10⁻¹⁹ C', correct: 'A', hint: 'Appears in Newton’s Law of Universal Gravitation.' },
          { q: 'If the speed of a car is doubled, its kinetic energy becomes:', a: '2 times', b: '3 times', c: '4 times', d: 'Unchanged', correct: 'C', hint: 'Kinetic energy depends on the square of speed (v²).' },
          { q: 'What device converts mechanical energy into electrical energy?', a: 'Electric motor', b: 'Electric generator/Dynamo', c: 'Transformer', d: 'Battery', correct: 'B', hint: 'Operates on Faraday’s law of electromagnetic induction.' },
          { q: 'What force keeps a satellite moving in a circular orbit around a planet?', a: 'Centrifugal force', b: 'Centripetal force (gravity)', c: 'Electromagnetic force', d: 'Nuclear force', correct: 'B', hint: 'Center-seeking force provided by gravity.' },
          { q: 'What is the tendency of a body to resist angular acceleration called?', a: 'Linear inertia', b: 'Moment of inertia', c: 'Torque', d: 'Angular momentum', correct: 'B', hint: 'The rotational analog of mass.' },
          { q: 'Which quantity is always conserved in an isolated system during all collisions?', a: 'Kinetic energy', b: 'Total linear momentum', c: 'Velocity', d: 'Temperature', correct: 'B', hint: 'Law of Conservation of Linear Momentum.' }
        ]
      },
      {
        id: 'sci_electricity',
        name: 'Electricity, Current & Magnetism',
        description: 'Ohm’s law, series and parallel circuits, magnetic fields, and electromagnetic induction.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'What is the mathematical equation for Ohm’s Law?', a: 'V = I · R', b: 'V = I / R', c: 'I = V · R', d: 'R = V · I', correct: 'A', hint: 'Voltage = Current × Resistance.' },
          { q: 'What is the SI unit of electric current?', a: 'Volt', b: 'Ampere', c: 'Ohm', d: 'Coulomb', correct: 'B', hint: 'Named after André-Marie Ampère.' },
          { q: 'What is the SI unit of electrical resistance?', a: 'Watt', b: 'Farad', c: 'Ohm (Ω)', d: 'Henry', correct: 'C', hint: 'Represented by Greek capital letter omega.' },
          { q: 'In a series circuit, what quantity remains constant through all resistors?', a: 'Voltage', b: 'Current', c: 'Power', d: 'Resistance', correct: 'B', hint: 'There is only one single continuous path for current.' },
          { q: 'In a parallel circuit with two 10 Ω resistors, what is the equivalent resistance?', a: '20 Ω', b: '10 Ω', c: '5 Ω', d: '2.5 Ω', correct: 'C', hint: '1/R = 1/10 + 1/10 = 2/10, so R = 5 Ω.' },
          { q: 'Which instrument is used to measure electrical potential difference (voltage)?', a: 'Ammeter', b: 'Voltmeter', c: 'Galvanometer', d: 'Ohmmeter', correct: 'B', hint: 'Always connected in parallel across the component.' },
          { q: 'What is the rate at which electrical energy is dissipated in a circuit called?', a: 'Charge', b: 'Electric Power (P = VI)', c: 'Capacitance', d: 'Impedance', correct: 'B', hint: 'Measured in Watts (W).' },
          { q: 'What is the unit used by electric utility companies for billing energy?', a: 'Watt-second', b: 'Kilowatt-hour (kWh)', c: 'Joule-second', d: 'Volt-ampere', correct: 'B', hint: '1 kWh = 3.6 × 10⁶ Joules.' },
          { q: 'What kind of magnetic field is produced around a straight current-carrying wire?', a: 'Parallel straight lines', b: 'Concentric circular loops', c: 'Radial spokes', d: 'Zero field', correct: 'B', hint: 'Determined using the Right-Hand Thumb Rule.' },
          { q: 'What rule gives the direction of force on a current-carrying conductor in a magnetic field?', a: 'Fleming’s Left-Hand Rule', b: 'Fleming’s Right-Hand Rule', c: 'Lenz’s Law', d: 'Ampere’s Law', correct: 'A', hint: 'Used for electric motors (Thumb = Motion, Forefinger = Field, Center = Current).' },
          { q: 'What is a coil of wire wound closely in the shape of a cylinder called?', a: 'Capacitor', b: 'Solenoid', c: 'Rheostat', d: 'Diode', correct: 'B', hint: 'Behaves like a bar magnet when energized.' },
          { q: 'Which material is typically used inside an electromagnet core for easy magnetization?', a: 'Steel', b: 'Soft iron', c: 'Copper', d: 'Aluminum', correct: 'B', hint: 'High magnetic permeability and low coercivity.' },
          { q: 'What phenomenon did Michael Faraday discover in 1831?', a: 'Electromagnetic induction', b: 'Static electricity', c: 'Photoelectric effect', d: 'Radioactivity', correct: 'A', hint: 'A changing magnetic flux induces an electromotive force (EMF).' },
          { q: 'What type of current is supplied to residential homes from wall outlets?', a: 'Direct Current (DC)', b: 'Alternating Current (AC)', c: 'Static Current', d: 'Pulsed DC', correct: 'B', hint: 'Reverses direction periodically (50 Hz or 60 Hz).' },
          { q: 'What safety device contains a thin wire that melts when current exceeds a safe limit?', a: 'Electric Fuse', b: 'Switch', c: 'Resistor', d: 'Galvanometer', correct: 'A', hint: 'Protects household wiring from fires due to short circuits.' },
          { q: 'What is the charge of a single electron?', a: '-1.6 × 10⁻¹⁹ Coulombs', b: '+1.6 × 10⁻¹⁹ Coulombs', c: '-9.1 × 10⁻³¹ Coulombs', d: '1 Coulomb', correct: 'A', hint: 'Fundamental elementary negative charge.' },
          { q: 'Which color wire is standard for Earth (ground) connection in modern safety standards?', a: 'Red', b: 'Black', c: 'Green or Green-Yellow', d: 'Blue', correct: 'C', hint: 'Protects users from electric shocks by diverting stray current.' },
          { q: 'What is the property of a conductor that opposes the flow of electric charges?', a: 'Conductance', b: 'Resistance', c: 'Voltage', d: 'Inductance', correct: 'B', hint: 'Depends on material resistivity, length, and cross-sectional area.' },
          { q: 'What is the resistance of an ideal ammeter?', a: 'Infinite', b: 'Zero', c: '100 Ω', d: '1 kΩ', correct: 'B', hint: 'Must not impede the current it is measuring in series.' },
          { q: 'What happens to the magnetic field strength of a solenoid when its turns are doubled?', a: 'Halved', b: 'Doubled', c: 'Unchanged', d: 'Quadrupled', correct: 'B', hint: 'B = μ₀ · n · I, where n is turns per unit length.' }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. MATHEMATICS
  // =========================================================================
  Mathematics: {
    name: 'Mathematics',
    description: 'Master algebraic expressions, equation solving, geometric theorems, coordinate systems, and probability.',
    topics: [
      {
        id: 'math_linear_eq',
        name: 'Linear Equations & Expressions',
        description: 'Single-variable and two-variable linear equations, slope, y-intercept, and algebraic substitution.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'Solve for x: 2x + 5 = 15', a: 'x = 5', b: 'x = 10', c: 'x = 7.5', d: 'x = 4', correct: 'A', hint: 'Subtract 5 from both sides, then divide by 2.' },
          { q: 'Solve for y: 3y - 9 = 0', a: 'y = 0', b: 'y = 3', c: 'y = 9', d: 'y = -3', correct: 'B', hint: 'Add 9 to both sides and divide by 3.' },
          { q: 'Solve for z: 4z + 8 = 32', a: 'z = 4', b: 'z = 8', c: 'z = 6', d: 'z = 10', correct: 'C', hint: '4z = 24, so z = 24 / 4.' },
          { q: 'What is the y-intercept of the line y = 3x - 7?', a: '(0, 3)', b: '(3, 0)', c: '(0, -7)', d: '(-7, 0)', correct: 'C', hint: 'In y = mx + c, the y-intercept is (0, c).' },
          { q: 'What is the slope of the line passing through (2, 3) and (4, 11)?', a: '2', b: '4', c: '8', d: '0.5', correct: 'B', hint: 'Slope m = (y₂ - y₁) / (x₂ - x₁) = (11 - 3)/(4 - 2) = 8/2.' },
          { q: 'Simplify the algebraic expression: 5x + 3y - 2x + 7y', a: '7x + 10y', b: '3x + 10y', c: '10x + 3y', d: '3x + 4y', correct: 'B', hint: 'Combine like terms: (5x - 2x) + (3y + 7y).' },
          { q: 'Simplify: 4a + 2b - a - 5b', a: '3a - 3b', b: '5a - 3b', c: '3a + 7b', d: '4a - 3b', correct: 'A', hint: '(4a - a) + (2b - 5b) = 3a - 3b.' },
          { q: 'What is the slope of a horizontal line y = 5?', a: 'Undefined', b: '0', c: '5', d: '1', correct: 'B', hint: 'Horizontal lines have zero vertical change (rise = 0).' },
          { q: 'What is the slope of a vertical line x = 3?', a: '0', b: '3', c: 'Undefined', d: '1', correct: 'C', hint: 'Division by zero change in x (run = 0) is undefined.' },
          { q: 'Find the solution to the system: x + y = 10 and x - y = 2', a: 'x = 6, y = 4', b: 'x = 5, y = 5', c: 'x = 8, y = 2', d: 'x = 7, y = 3', correct: 'A', hint: 'Add the two equations: 2x = 12 → x = 6.' },
          { q: 'What is the solution of 5(x - 2) = 20?', a: 'x = 4', b: 'x = 6', c: 'x = 2', d: 'x = 8', correct: 'B', hint: 'Divide by 5 to get x - 2 = 4, then add 2.' },
          { q: 'If 3x + 2 = 2x + 7, what is x?', a: 'x = 5', b: 'x = 9', c: 'x = 3', d: 'x = 4', correct: 'A', hint: 'Subtract 2x and subtract 2: x = 5.' },
          { q: 'What is the point of intersection of lines y = 2x and y = -x + 6?', a: '(2, 4)', b: '(3, 6)', c: '(1, 2)', d: '(4, 2)', correct: 'A', hint: 'Set 2x = -x + 6 → 3x = 6 → x = 2, y = 4.' },
          { q: 'Solve for m: m/4 + 3 = 7', a: 'm = 16', b: 'm = 28', c: 'm = 1', d: 'm = 12', correct: 'A', hint: 'm/4 = 4 → m = 16.' },
          { q: 'What are the two lines called if their slopes multiply to -1 (m₁ · m₂ = -1)?', a: 'Parallel', b: 'Perpendicular', c: 'Coincident', d: 'Skew', correct: 'B', hint: 'Negative reciprocal slopes indicate right-angle intersection.' },
          { q: 'Find the x-intercept of 2x + 4y = 12.', a: '(6, 0)', b: '(0, 3)', c: '(12, 0)', d: '(3, 0)', correct: 'A', hint: 'Set y = 0: 2x = 12 → x = 6.' },
          { q: 'Solve the inequality: 3x - 4 < 11', a: 'x < 5', b: 'x > 5', c: 'x < 7', d: 'x > 15', correct: 'A', hint: '3x < 15 → x < 5.' },
          { q: 'If a line has equation 2x - 3y = 6, what is its slope in slope-intercept form?', a: '2/3', b: '-2/3', c: '3/2', d: '-3/2', correct: 'A', hint: '3y = 2x - 6 → y = (2/3)x - 2.' },
          { q: 'Solve for p: 2(p + 3) - 4 = 10', a: 'p = 4', b: 'p = 6', c: 'p = 3', d: 'p = 5', correct: 'A', hint: '2p + 6 - 4 = 10 → 2p + 2 = 10 → 2p = 8.' },
          { q: 'A car rental charges $30 plus $0.20 per mile. If total cost is $70, how many miles were driven?', a: '200 miles', b: '150 miles', c: '250 miles', d: '100 miles', correct: 'A', hint: '30 + 0.20m = 70 → 0.20m = 40 → m = 200.' }
        ]
      },
      {
        id: 'math_probability',
        name: 'Probability, Sets & Venn Diagrams',
        description: 'Venn diagrams, set intersections, independent events, permutations, and theoretical probability.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'In a class of 30, 18 play Soccer, 14 play Basketball, and 5 play both. How many play neither?', a: '3', b: '5', c: '8', d: '2', correct: 'A', hint: 'Total playing at least one = 18 + 14 - 5 = 27. 30 - 27 = 3.' },
          { q: 'If Set A has 10 elements, Set B has 15 elements, and A ∩ B has 4 elements, how many are in A ∪ B?', a: '25', b: '21', c: '19', d: '29', correct: 'B', hint: '|A ∪ B| = |A| + |B| - |A ∩ B| = 10 + 15 - 4 = 21.' },
          { q: 'What is the probability of rolling a prime number on a standard 6-sided die?', a: '1/6', b: '1/3', c: '1/2', d: '2/3', correct: 'C', hint: 'Prime outcomes are {2, 3, 5} → 3/6 = 1/2.' },
          { q: 'What is the sum of the probabilities of all mutually exclusive elementary outcomes in a sample space?', a: '0', b: '0.5', c: '1', d: '100', correct: 'C', hint: 'Total probability of the entire sample space always equals 1.' },
          { q: 'Two fair coins are flipped simultaneously. What is the probability of getting at least one head?', a: '1/4', b: '1/2', c: '3/4', d: '1', correct: 'C', hint: 'Outcomes are {HH, HT, TH, TT}. 3 out of 4 have at least one head.' },
          { q: 'What is the probability of drawing an Ace from a standard 52-card deck?', a: '1/13', b: '4/13', c: '1/52', d: '1/4', correct: 'A', hint: 'There are 4 aces in 52 cards: 4/52 = 1/13.' },
          { q: 'If P(A) = 0.4 and events A and B are mutually exclusive, what is P(A ∩ B)?', a: '0.4', b: '0', c: '0.2', d: '1', correct: 'B', hint: 'Mutually exclusive events cannot occur simultaneously.' },
          { q: 'If A and B are independent events with P(A) = 0.5 and P(B) = 0.6, what is P(A ∩ B)?', a: '0.3', b: '1.1', c: '0.1', d: '0.55', correct: 'A', hint: 'For independent events, P(A ∩ B) = P(A) · P(B) = 0.5 · 0.6 = 0.3.' },
          { q: 'What is the probability of rolling a total sum of 7 with two standard 6-sided dice?', a: '1/6', b: '1/12', c: '7/36', d: '5/36', correct: 'A', hint: 'Pairs summing to 7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6/36 = 1/6.' },
          { q: 'What is the complement of event E with probability P(E) = 0.35?', a: '0.35', b: '0.65', c: '0.70', d: '-0.35', correct: 'B', hint: 'P(E\') = 1 - P(E) = 1 - 0.35 = 0.65.' },
          { q: 'In how many different orders can 4 books be arranged on a single shelf?', a: '12', b: '16', c: '24', d: '48', correct: 'C', hint: '4! = 4 × 3 × 2 × 1 = 24.' },
          { q: 'A bag contains 5 red, 3 green, and 2 blue marbles. What is the probability of drawing a green marble?', a: '3/10', b: '1/3', c: '1/2', d: '3/7', correct: 'A', hint: 'Total = 10 marbles. Favorable green = 3/10.' },
          { q: 'What is the probability of drawing a red card OR a King from a 52-card deck?', a: '28/52', b: '26/52', c: '30/52', d: '15/52', correct: 'A', hint: '26 red + 4 kings - 2 red kings = 28/52.' },
          { q: 'In a Venn diagram, what region represents elements in A but NOT in B?', a: 'A ∩ B', b: 'A \\ B (A - B)', c: 'A ∪ B', d: 'B \\ A', correct: 'B', hint: 'The set difference of A and B.' },
          { q: 'What is the value of 5C2 (combinations of 5 choose 2)?', a: '10', b: '20', c: '15', d: '5', correct: 'A', hint: '5! / (2! · 3!) = (5 × 4) / 2 = 10.' },
          { q: 'If P(A|B) = P(A), what can be concluded about events A and B?', a: 'They are mutually exclusive', b: 'They are independent', c: 'They are complementary', d: 'P(B) = 0', correct: 'B', hint: 'Occurrence of B does not alter the likelihood of A.' },
          { q: 'A card is drawn and not replaced. What is the probability that both of two drawn cards are Aces?', a: '4/52 × 3/51', b: '4/52 × 4/52', c: '2/52', d: '1/13 × 1/13', correct: 'A', hint: 'Dependent probability without replacement.' },
          { q: 'What is the median of the data set: 3, 7, 8, 5, 12, 14, 21, 13, 18?', a: '8', b: '12', c: '10', d: '13', correct: 'B', hint: 'Ordered: 3, 5, 7, 8, 12, 13, 14, 18, 21. Middle value is 12.' },
          { q: 'What is the mode of the numbers: 4, 8, 6, 8, 9, 8, 2, 4, 1?', a: '4', b: '6', c: '8', d: '9', correct: 'C', hint: 'The number 8 occurs most frequently (3 times).' },
          { q: 'If the variance of a distribution is 49, what is its standard deviation?', a: '7', b: '24.5', c: '98', d: '2401', correct: 'A', hint: 'Standard deviation is the square root of variance: √49 = 7.' }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. ENGLISH
  // =========================================================================
  English: {
    name: 'English',
    description: 'Enhance grammatical syntax, active/passive voice, figurative devices, comprehension, and vocabulary.',
    topics: [
      {
        id: 'eng_voice_syntax',
        name: 'Active & Passive Voice & Syntax',
        description: 'Converting active voice to passive voice, tense consistency, and structural sentence transformation.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'Convert to passive: "The chef prepared a delectable feast."', a: 'A delectable feast was prepared by the chef.', b: 'A delectable feast had been prepared by the chef.', c: 'The chef was preparing a feast.', d: 'A feast is prepared by chef.', correct: 'A', hint: 'Simple past active becomes "was/were + past participle".' },
          { q: 'Identify the voice: "The historic monument was constructed in the fourteenth century."', a: 'Active Voice', b: 'Passive Voice', c: 'Imperative Voice', d: 'Subjunctive Voice', correct: 'B', hint: 'Subject receives the action; "was constructed".' },
          { q: 'Convert to passive: "She is writing an inspiring novel."', a: 'An inspiring novel is written by her.', b: 'An inspiring novel is being written by her.', c: 'An inspiring novel was written by her.', d: 'She had an inspiring novel written.', correct: 'B', hint: 'Present continuous passive uses "is/are being + past participle".' },
          { q: 'Convert to active: "The prize was won by the youngest participant."', a: 'The youngest participant won the prize.', b: 'The youngest participant was winning the prize.', c: 'The prize won the youngest participant.', d: 'Winning the prize was by the youngest.', correct: 'A', hint: 'Make the agent ("the youngest participant") the subject.' },
          { q: 'Which sentence demonstrates proper Subject-Verb Agreement?', a: 'Neither the teacher nor the students was present.', b: 'Neither the teacher nor the students were present.', c: 'Neither the teacher or students is present.', d: 'Neither teacher nor students has been present.', correct: 'B', hint: 'With "neither...nor", the verb agrees with the closer subject ("students").' },
          { q: 'Which sentence correctly uses "whom"?', a: 'Whom is knocking at the door?', b: 'To whom should this letter be addressed?', c: 'Whom wrote this bestselling novel?', d: 'Whom delivered the package?', correct: 'B', hint: '"Whom" functions as the object of a preposition ("to whom").' },
          { q: 'Convert to passive: "Scientists have discovered a new exoplanet."', a: 'A new exoplanet had been discovered by scientists.', b: 'A new exoplanet has been discovered by scientists.', c: 'A new exoplanet was discovered by scientists.', d: 'A new exoplanet is discovered by scientists.', correct: 'B', hint: 'Present perfect passive uses "has/have been + past participle".' },
          { q: 'Identify the grammatical error: "Each of the participants were given a certificate."', a: 'were given (should be was given)', b: 'Each (should be Every)', c: 'participants (should be participant)', d: 'certificate (should be certification)', correct: 'A', hint: '"Each" is grammatically singular and takes a singular verb ("was given").' },
          { q: 'Which conjunction pair is correlative?', a: 'Because... so', b: 'Not only... but also', c: 'Since... therefore', d: 'Although... yet', correct: 'B', hint: '"Not only... but also" connect balanced grammatical clauses.' },
          { q: 'Choose the correct sentence in subjunctive mood:', a: 'If I was you, I would accept the scholarship.', b: 'If I were you, I would accept the scholarship.', c: 'If I am you, I will accept the scholarship.', d: 'If I will be you, I would accept.', correct: 'B', hint: 'Hypothetical contrary-to-fact condition takes "were".' },
          { q: 'Convert to passive: "Do not open the emergency exit."', a: 'Let not the emergency exit be opened.', b: 'The emergency exit should not open.', c: 'You do not open the emergency exit.', d: 'Not opening emergency exit is good.', correct: 'A', hint: 'Imperative negative passive: "Let not + subject + be + past participle".' },
          { q: 'Identify the part of speech of "quickly" in: "She solved the puzzle quickly."', a: 'Adjective', b: 'Adverb', c: 'Noun', d: 'Preposition', correct: 'B', hint: 'Modifies the verb "solved".' },
          { q: 'What is a sentence consisting of two independent clauses joined by a coordinating conjunction called?', a: 'Simple sentence', b: 'Compound sentence', c: 'Complex sentence', d: 'Compound-complex sentence', correct: 'B', hint: 'Joined using FANBOYS (for, and, nor, but, or, yet, so).' },
          { q: 'Convert to active: "The speech will be delivered by the principal tomorrow."', a: 'The principal will deliver the speech tomorrow.', b: 'The principal delivered the speech tomorrow.', c: 'The principal is delivering speech tomorrow.', d: 'The speech is to be delivered by principal.', correct: 'A', hint: 'Future active: "will + base verb".' },
          { q: 'Choose the correct form: "Ten kilometers ______ a long distance to walk."', a: 'are', b: 'is', c: 'were', d: 'being', correct: 'B', hint: 'Units of measurement/distance take a singular verb when considered as a unit.' },
          { q: 'Identify the dangling modifier in: "Walking into the room, the smoke was overwhelming."', a: 'Walking into the room', b: 'the smoke', c: 'was overwhelming', d: 'No error', correct: 'A', hint: 'The smoke was not walking into the room.' },
          { q: 'What type of clause is underlined: "The student *who scored highest* won a trophy"?', a: 'Adverbial clause', b: 'Relative/Adjective clause', c: 'Noun clause', d: 'Prepositional phrase', correct: 'B', hint: 'Modifies the noun "student".' },
          { q: 'Choose the correct punctuation: "She likes three fruits ______ apples, bananas, and cherries."', a: 'semi-colon (;)', b: 'colon (:)', c: 'dash (—)', d: 'comma (,)', correct: 'B', hint: 'A colon introduces a list following a complete independent clause.' },
          { q: 'Convert to passive: "Who wrote the play Hamlet?"', a: 'By whom was the play Hamlet written?', b: 'Who was Hamlet written by?', c: 'Was Hamlet written by who?', d: 'By whom is Hamlet wrote?', correct: 'A', hint: '"Who" becomes "By whom + auxiliary + subject + past participle".' },
          { q: 'Which sentence uses parallel structure correctly?', a: 'She enjoys hiking, to swim, and biking.', b: 'She enjoys hiking, swimming, and biking.', c: 'She enjoys to hike, swimming, and to bike.', d: 'She enjoys hike, swim, and biking.', correct: 'B', hint: 'All items in the list must share the same grammatical gerund form (-ing).' }
        ]
      },
      {
        id: 'eng_vocab_lit',
        name: 'Literary Devices & Vocabulary',
        description: 'Metaphors, similes, personification, hyperbole, contextual antonyms and synonyms.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'What figure of speech is: "The classroom was a zoo during recess"?', a: 'Simile', b: 'Metaphor', c: 'Personification', d: 'Onomatopoeia', correct: 'B', hint: 'Direct implicit comparison without using "like" or "as".' },
          { q: 'What figure of speech is: "The wind whispered softly through the dark trees"?', a: 'Metaphor', b: 'Personification', c: 'Hyperbole', d: 'Irony', correct: 'B', hint: 'Attributing human qualities (whispering) to non-human elements.' },
          { q: 'What figure of speech is: "I have told you a million times to clean your room"?', a: 'Oxymoron', b: 'Hyperbole', c: 'Litotes', d: 'Synecdoche', correct: 'B', hint: 'Intentional extreme exaggeration for rhetorical effect.' },
          { q: 'What figure of speech is: "O bitter sweet love!"?', a: 'Oxymoron', b: 'Euphemism', c: 'Allusion', d: 'Metonymy', correct: 'A', hint: 'Juxtaposing two contradictory terms side-by-side.' },
          { q: 'What sound device is used in: "Peter Piper picked a peck of pickled peppers"?', a: 'Assonance', b: 'Alliteration', c: 'Consonance', d: 'Rhyme', correct: 'B', hint: 'Repetition of initial consonant sounds in neighboring words.' },
          { q: 'What is the synonym of the word "BENEVOLENT"?', a: 'Malicious', b: 'Kind and charitable', c: 'Indifferent', d: 'Arrogant', correct: 'B', hint: 'Latin prefix "bene-" means good or well.' },
          { q: 'What is the antonym of the word "EPHEMERAL"?', a: 'Fleeting', b: 'Permanent/Enduring', c: 'Transient', d: 'Fragile', correct: 'B', hint: 'Ephemeral means lasting for a very short time.' },
          { q: 'What figure of speech is: "The buzzing bee flew briskly by"?', a: 'Onomatopoeia', b: 'Irony', c: 'Metaphor', d: 'Paradox', correct: 'A', hint: 'The word "buzzing" phonetically mimics the sound it describes.' },
          { q: 'What is an indirect reference to a famous historical, literary, or biblical figure called?', a: 'Allegory', b: 'Allusion', c: 'Illusion', d: 'Analogy', correct: 'B', hint: 'Such as describing someone as having an "Achilles\' heel".' },
          { q: 'What figure of speech uses understatement by stating the negative of its opposite?', a: 'Litotes', b: 'Hyperbole', c: 'Anaphora', d: 'Chiasmus', correct: 'A', hint: 'E.g., "She is not unmindful" or "Not bad at all".' },
          { q: 'What does the idiom "burn the midnight oil" mean?', a: 'To waste resources', b: 'To work or study late into the night', c: 'To cause an accident', d: 'To wake up early at dawn', correct: 'B', hint: 'Refers to working by candlelight or oil lamp.' },
          { q: 'What is the synonym of "METICULOUS"?', a: 'Careless', b: 'Extremely careful and precise', c: 'Hasty', d: 'Ambiguous', correct: 'B', hint: 'Showing great attention to detail.' },
          { q: 'What is the term for a story with a hidden symbolic meaning beneath the surface?', a: 'Fable', b: 'Allegory', c: 'Parable', d: 'Anecdote', correct: 'B', hint: 'George Orwell\'s Animal Farm is a famous political allegory.' },
          { q: 'What figure of speech is: "She is as brave as a lion"?', a: 'Metaphor', b: 'Simile', c: 'Apostrophe', d: 'Pun', correct: 'B', hint: 'Explicit comparison using "as" or "like".' },
          { q: 'What is the antonym of "UBIQUITOUS"?', a: 'Omnipresent', b: 'Rare/Scarce', c: 'Pervasive', d: 'Universal', correct: 'B', hint: 'Ubiquitous means found everywhere.' },
          { q: 'What is the term for word choice employed by an author or poet?', a: 'Syntax', b: 'Diction', c: 'Meter', d: 'Prosody', correct: 'B', hint: 'Can be formal, colloquial, poetic, or archaic.' },
          { q: 'What figure of speech is: "Parting is such sweet sorrow"?', a: 'Oxymoron', b: 'Simile', c: 'Hyperbole', d: 'Understatement', correct: 'A', hint: 'Contradictory emotions expressed together in Romeo & Juliet.' },
          { q: 'What does the prefix "MAL-" mean in words like malnutrition and malfunction?', a: 'Beneficial', b: 'Bad / Abnormal / Poor', c: 'Repeated', d: 'Underneath', correct: 'B', hint: 'Latin root for evil, bad, or wrongful.' },
          { q: 'What is a recurring thematic subject, idea, or artistic element in literature called?', a: 'Motif', b: 'Climax', c: 'Exposition', d: 'Denouement', correct: 'A', hint: 'Reinforces the central theme through repetition.' },
          { q: 'What is the synonym of "PRAGMATIC"?', a: 'Idealistic', b: 'Practical and realistic', c: 'Dogmatic', d: 'Pessimistic', correct: 'B', hint: 'Dealing with matters sensibly and realistically.' }
        ]
      }
    ]
  },

  // =========================================================================
  // 4. COMPUTER SCIENCE
  // =========================================================================
  'Computer Science': {
    name: 'Computer Science',
    description: 'Learn computational thinking, variables, data structures, recursion, algorithms, and OOP paradigms.',
    topics: [
      {
        id: 'cs_fundamentals',
        name: 'Variables, Loops & Data Structures',
        description: 'Memory allocation, data types, conditional branching, loops, arrays, stacks, and queues.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'What is the time complexity of searching an element in an unsorted array of size N?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N²)', correct: 'C', hint: 'Linear scan requires checking each item in the worst case.' },
          { q: 'Which data structure operates on a Last-In, First-Out (LIFO) principle?', a: 'Queue', b: 'Stack', c: 'Linked List', d: 'Binary Tree', correct: 'B', hint: 'Think of a stack of dinner plates.' },
          { q: 'Which data structure operates on a First-In, First-Out (FIFO) principle?', a: 'Stack', b: 'Queue', c: 'Heap', d: 'Graph', correct: 'B', hint: 'Like people waiting in line at a ticket counter.' },
          { q: 'What is the binary representation of the decimal integer 13?', a: '1101', b: '1011', c: '1110', d: '1001', correct: 'A', hint: '8 + 4 + 0 + 1 = 13 (2³ + 2² + 0 + 2⁰).' },
          { q: 'In Python, which built-in function returns the number of items in a list?', a: 'size()', b: 'length()', c: 'len()', d: 'count()', correct: 'C', hint: 'Short for length.' },
          { q: 'What will be the output of 7 % 3 in most programming languages?', a: '2', b: '1', c: '0', d: '2.33', correct: 'B', hint: 'Modulo operator returns the remainder of division (7 = 3 × 2 + 1).' },
          { q: 'Which sorting algorithm has an average time complexity of O(N log N)?', a: 'Bubble Sort', b: 'Selection Sort', c: 'Merge Sort', d: 'Insertion Sort', correct: 'C', hint: 'Divide-and-conquer algorithm that recursively splits arrays.' },
          { q: 'What is a function that calls itself called?', a: 'Anonymous function', b: 'Recursive function', c: 'Higher-order function', d: 'Callback', correct: 'B', hint: 'Must include a base case to terminate execution.' },
          { q: 'In Object-Oriented Programming, what is the bundling of data and methods called?', a: 'Polymorphism', b: 'Inheritance', c: 'Encapsulation', d: 'Abstraction', correct: 'C', hint: 'Restricting direct access to internal object components.' },
          { q: 'What keyword is used in JavaScript to declare a block-scoped reassignable variable?', a: 'var', b: 'let', c: 'const', d: 'def', correct: 'B', hint: 'Introduced in ES6 alongside const.' },
          { q: 'What is the worst-case time complexity of Binary Search on a sorted array?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N log N)', correct: 'B', hint: 'Halves the search space at each successive step.' },
          { q: 'Which data structure consists of nodes where each node points to the next?', a: 'Array', b: 'Linked List', c: 'Stack', d: 'Hash Table', correct: 'B', hint: 'Dynamic linear structure with data and next pointer.' },
          { q: 'What does SQL stand for in database management?', a: 'Structured Query Language', b: 'Sequential Query Logic', c: 'Standard Quick Language', d: 'System Query Library', correct: 'A', hint: 'Standard language for relational database queries.' },
          { q: 'What boolean operator yields TRUE only when both operands are TRUE?', a: 'OR (||)', b: 'AND (&&)', c: 'NOT (!)', d: 'XOR (^)', correct: 'B', hint: 'Conjunction in mathematical logic.' },
          { q: 'In a hash table, what occurs when two different keys hash to the same index?', a: 'Overflow error', b: 'Hash Collision', c: 'Segmentation fault', d: 'Deadlock', correct: 'B', hint: 'Handled via separate chaining or open addressing.' },
          { q: 'What is the index of the first element in zero-indexed languages (e.g., Python, C, JS)?', a: '1', b: '0', c: '-1', d: 'null', correct: 'B', hint: 'Standard 0-based memory indexing.' },
          { q: 'What is an infinite loop that exhausts call stack memory in recursion called?', a: 'Memory leak', b: 'Stack Overflow', c: 'Buffer underflow', d: 'Null pointer exception', correct: 'B', hint: 'Occurs when recursion lacks a valid base case.' },
          { q: 'Which protocol is standard for secure encrypted web communication?', a: 'HTTP', b: 'HTTPS', c: 'FTP', d: 'SMTP', correct: 'B', hint: 'Hypertext Transfer Protocol Secure utilizing TLS/SSL.' },
          { q: 'What is the term for a blueprint or template from which objects are instantiated?', a: 'Method', b: 'Class', c: 'Instance', d: 'Interface', correct: 'B', hint: 'Defines state variables and behavior methods.' },
          { q: 'What fundamental algorithm searches a graph or tree by exploring as deep as possible first?', a: 'Breadth-First Search (BFS)', b: 'Depth-First Search (DFS)', c: 'Dijkstra’s Algorithm', d: 'Kruskal’s Algorithm', correct: 'B', hint: 'Often implemented using a recursion stack.' }
        ]
      },
      {
        id: 'cs_algorithms',
        name: 'Algorithms & Time Complexity',
        description: 'Big-O notation, greedy approaches, divide-and-conquer, sorting, and dynamic programming.',
        difficulty: 'Hard',
        duration: 20,
        questions: [
          { q: 'What does Big-O notation characterize?', a: 'Exact runtime in milliseconds', b: 'Upper bound on growth rate of an algorithm', c: 'Memory consumption in megabytes', d: 'Lines of compiled bytecode', correct: 'B', hint: 'Represents the asymptotic upper bound of algorithm complexity.' },
          { q: 'What is the time complexity of QuickSort in the average case?', a: 'O(N)', b: 'O(N log N)', c: 'O(N²)', d: 'O(log N)', correct: 'B', hint: 'Divide-and-conquer partition with balanced pivots on average.' },
          { q: 'What is the worst-case time complexity of QuickSort?', a: 'O(N)', b: 'O(N log N)', c: 'O(N²)', d: 'O(2^N)', correct: 'C', hint: 'Occurs when the chosen pivot is always the smallest or largest element.' },
          { q: 'Which algorithmic paradigm solves a problem by combining solutions to sub-problems?', a: 'Divide and Conquer', b: 'Brute Force', c: 'Greedy Choice', d: 'Backtracking', correct: 'A', hint: 'Used by MergeSort, QuickSort, and Strassen matrix multiplication.' },
          { q: 'Dijkstra’s algorithm finds what in a weighted graph with non-negative edges?', a: 'Maximum flow', b: 'Shortest path from single source', c: 'Minimum spanning tree', d: 'Topological sort', correct: 'B', hint: 'Greedily explores vertices with minimum tentative distance.' },
          { q: 'Which algorithmic technique stores previously computed subproblem solutions?', a: 'Recursion', b: 'Dynamic Programming (Memoization)', c: 'Iteration', d: 'Randomization', correct: 'B', hint: 'Avoids redundant calculations of overlapping subproblems.' },
          { q: 'What is the time complexity of finding the maximum element in an unsorted array?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N²)', correct: 'C', hint: 'Must examine each element at least once.' },
          { q: 'Which sorting algorithm is stable and guaranteed O(N log N) worst-case?', a: 'QuickSort', b: 'HeapSort', c: 'MergeSort', d: 'SelectionSort', correct: 'C', hint: 'Maintains relative order of equal keys and divides array evenly.' },
          { q: 'What is the space complexity of standard recursive Depth-First Search on a tree of height H?', a: 'O(1)', b: 'O(H)', c: 'O(N²)', d: 'O(2^H)', correct: 'B', hint: 'Determined by the maximum depth of the function call stack.' },
          { q: 'Which algorithm finds a Minimum Spanning Tree using a greedy edge-by-edge approach?', a: 'Kruskal’s Algorithm', b: 'Bellman-Ford', c: 'Floyd-Warshall', d: 'A* Search', correct: 'A', hint: 'Sorts all edges and uses Disjoint Set Union (DSU) to avoid cycles.' },
          { q: 'What is the time complexity of Binary Search?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N log N)', correct: 'B', hint: 'Divides search space by 2 on each comparison.' },
          { q: 'What is a Greedy algorithm characteristic?', a: 'Always backtracks when stuck', b: 'Makes locally optimal choice at each step', c: 'Tests all possible combinations', d: 'Guarantees global optimum for all problems', correct: 'B', hint: 'Chooses the best immediate option without reconsidering.' },
          { q: 'Which data structure is optimal for implementing Dijkstra’s algorithm?', a: 'Queue', b: 'Min-Priority Queue / Binary Heap', c: 'Stack', d: 'Circular Linked List', correct: 'B', hint: 'Allows O(log V) extraction of the minimum distance vertex.' },
          { q: 'What is the time complexity of computing Fibonacci using naive recursion?', a: 'O(N)', b: 'O(N²)', c: 'O(2^N)', d: 'O(log N)', correct: 'C', hint: 'Exponential tree of redundant calls T(n) = T(n-1) + T(n-2).' },
          { q: 'What is the time complexity of computing Fibonacci with memoization (DP)?', a: 'O(1)', b: 'O(N)', c: 'O(N²)', d: 'O(2^N)', correct: 'B', hint: 'Each subproblem from 0 to N is computed exactly once.' },
          { q: 'What is the best-case time complexity of Bubble Sort with early termination flag?', a: 'O(1)', b: 'O(N)', c: 'O(N log N)', d: 'O(N²)', correct: 'B', hint: 'If array is already sorted, passes through once in O(N).' },
          { q: 'Which algorithm detects whether a directed graph contains a cycle?', a: 'Topological Sort / DFS with color states', b: 'Prim’s Algorithm', c: 'Binary Search', d: 'Euclidean Algorithm', correct: 'A', hint: 'Detects back-edges during depth-first traversal.' },
          { q: 'What is the time complexity of the Euclidean algorithm to find GCD(a, b)?', a: 'O(1)', b: 'O(log(min(a, b)))', c: 'O(a + b)', d: 'O(a * b)', correct: 'B', hint: 'Logarithmic reduction in the smaller argument.' },
          { q: 'What problem class includes problems solvable in polynomial time?', a: 'NP-Complete', b: 'P', c: 'NP-Hard', d: 'EXPTIME', correct: 'B', hint: 'Deterministic polynomial time.' },
          { q: 'Which algorithmic paradigm is used in the N-Queens problem?', a: 'Backtracking', b: 'Divide and conquer', c: 'Greedy method', d: 'Linear programming', correct: 'A', hint: 'Explores states and backtracks upon invalid queen placement.' }
        ]
      },
      {
        id: 'cs_datastructures',
        name: 'Data Structures & Binary Search',
        description: 'Linked lists, trees, graphs, heaps, hash tables, and binary search trees.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'What is the height of a balanced Binary Search Tree containing N nodes?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N²)', correct: 'B', hint: 'Logarithmic height ensures fast search and insertion.' },
          { q: 'In a Binary Search Tree, where are elements smaller than the root located?', a: 'Right subtree', b: 'Left subtree', c: 'Root node', d: 'Random leaves', correct: 'B', hint: 'BST property: Left < Root < Right.' },
          { q: 'Which tree traversal visits nodes in non-decreasing order in a BST?', a: 'Pre-order', b: 'In-order', c: 'Post-order', d: 'Level-order', correct: 'B', hint: 'Left -> Root -> Right yields sorted values.' },
          { q: 'What is the worst-case lookup time in a hash table with poor hash distribution?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N log N)', correct: 'C', hint: 'All keys collapse into a single linked chain.' },
          { q: 'What data structure is used to implement Breadth-First Search (BFS)?', a: 'Stack', b: 'Queue', c: 'Priority Queue', d: 'Binary Tree', correct: 'B', hint: 'FIFO queue processes nodes level by level.' },
          { q: 'What is the time complexity to insert at the head of a Singly Linked List?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N²)', correct: 'A', hint: 'Just point the new node to the old head and update head pointer.' },
          { q: 'In a Max Heap, where is the largest element always located?', a: 'At the bottom leaf', b: 'At the root', c: 'In the middle level', d: 'At index N-1', correct: 'B', hint: 'Root node always holds maximum key in Max-Heap.' },
          { q: 'Which data structure represents a hierarchical relationship with parent and child nodes?', a: 'Graph', b: 'Tree', c: 'Stack', d: 'Matrix', correct: 'B', hint: 'Connected acyclic undirected or directed hierarchical graph.' },
          { q: 'What is the time complexity of deletion in an AVL tree with N nodes?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N log N)', correct: 'B', hint: 'Strict balance factor ensures height <= 1.44 log N.' },
          { q: 'How many children can a node in a binary tree have at most?', a: '1', b: '2', c: '3', d: 'Unlimited', correct: 'B', hint: 'Binary means each node has at most two children.' },
          { q: 'What data structure is used for undo operations in text editors?', a: 'Queue', b: 'Stack', c: 'Hash Table', d: 'Trie', correct: 'B', hint: 'LIFO order reverses actions in reverse chronological order.' },
          { q: 'Which data structure is ideal for prefix-based auto-complete searches?', a: 'Trie (Prefix Tree)', b: 'Heap', c: 'Linked List', d: 'Stack', correct: 'A', hint: 'Tree structure where keys are typically strings broken into characters.' },
          { q: 'What is the number of edges in a tree with N vertices?', a: 'N', b: 'N - 1', c: 'N + 1', d: '2N', correct: 'B', hint: 'A connected graph with N vertices and N-1 edges is a tree.' },
          { q: 'What is the worst-case search complexity of Binary Search?', a: 'O(1)', b: 'O(log N)', c: 'O(N)', d: 'O(N²)', correct: 'B', hint: 'Halves the space with every step.' },
          { q: 'Which condition must be met before applying Binary Search on an array?', a: 'Array must be sorted', b: 'Array must have prime size', c: 'Array must only contain integers', d: 'Array must be circular', correct: 'A', hint: 'Requires monotonic sorted order.' },
          { q: 'What collision resolution technique links elements at the same hash index?', a: 'Open Addressing', b: 'Separate Chaining', c: 'Linear Probing', d: 'Double Hashing', correct: 'B', hint: 'Each bucket contains a linked list of entries.' },
          { q: 'What is the space complexity of an adjacency matrix for a graph with V vertices?', a: 'O(V)', b: 'O(V + E)', c: 'O(V²)', d: 'O(E²)', correct: 'C', hint: 'V × V 2D matrix.' },
          { q: 'Which data structure implements a Double-Ended Queue?', a: 'Deque', b: 'Heap', c: 'BST', d: 'Vector', correct: 'A', hint: 'Allows insertion and deletion at both front and back.' },
          { q: 'What is the degree of a leaf node in a tree?', a: '0', b: '1', c: '2', d: 'Varies', correct: 'A', hint: 'Leaf nodes have no child branches.' },
          { q: 'What is an advantage of a circular linked list over a linear linked list?', a: 'Constant-time traversal to head from tail', b: 'Zero memory usage', c: 'Requires no pointers', d: 'Guaranteed O(1) search', correct: 'A', hint: 'Last node points back to the first node.' }
        ]
      },
      {
        id: 'cs_oop',
        name: 'Object-Oriented Programming & Recursion',
        description: 'Encapsulation, inheritance, polymorphism, abstraction, and recursive call stacks.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'Which OOP pillar restricts direct access to internal object components and methods?', a: 'Encapsulation', b: 'Polymorphism', c: 'Inheritance', d: 'Compilation', correct: 'A', hint: 'Bundling data and methods that operate on that data.' },
          { q: 'What is the term for a class deriving properties and behavior from another class?', a: 'Encapsulation', b: 'Inheritance', c: 'Overloading', d: 'Instantiation', correct: 'B', hint: 'Subclass inherits from superclass.' },
          { q: 'What OOP mechanism allows a method to have different implementations based on the caller object?', a: 'Polymorphism', b: 'Encapsulation', c: 'Garbage Collection', d: 'Serialization', correct: 'A', hint: 'Greek for "many forms".' },
          { q: 'What is an essential component required in every recursive function to prevent infinite execution?', a: 'Base Case', b: 'Loop counter', c: 'Try-catch block', d: 'Static variable', correct: 'A', hint: 'Terminating condition that returns without further recursion.' },
          { q: 'What call stack error occurs when recursion lacks a valid terminating base case?', a: 'Stack Overflow Error', b: 'Null Pointer Exception', c: 'Out of Bounds Error', d: 'Division by Zero', correct: 'A', hint: 'Memory limit of execution stack is exceeded.' }
        ]
      }
    ]
  },

  // =========================================================================
  // 5. PHYSICS
  // =========================================================================
  Physics: {
    name: 'Physics',
    description: 'Understand kinematics, Newton’s laws, optics, thermodynamics, and electromagnetism.',
    topics: [
      {
        id: 'phy_kinematics',
        name: 'Kinematics & Dynamics',
        description: 'Displacement, velocity, uniform acceleration, projectile motion, and force equilibrium.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'What does the slope of a velocity-time graph represent?', a: 'Displacement', b: 'Acceleration', c: 'Force', d: 'Work', correct: 'B', hint: 'dv/dt is rate of change of velocity.' },
          { q: 'What does the area under an acceleration-time graph represent?', a: 'Displacement', b: 'Change in velocity', c: 'Speed', d: 'Jerk', correct: 'B', hint: 'Integral of acceleration over time.' },
          { q: 'What is the trajectory of a projectile launched in uniform gravity?', a: 'Hyperbola', b: 'Parabola', c: 'Circle', d: 'Straight line', correct: 'B', hint: 'Quadratic equation in y with respect to x.' },
          { q: 'At what launch angle is maximum horizontal range achieved without air drag?', a: '30°', b: '45°', c: '60°', d: '90°', correct: 'B', hint: 'Sin(2θ) reaches its maximum value of 1 at 2 × 45° = 90°.' },
          { q: 'Which equation correctly relates final velocity, initial velocity, acceleration, and displacement?', a: 'v² = u² + 2as', b: 'v = u + as²', c: 's = vt + at²', d: 'v² = u + 2as', correct: 'A', hint: 'Third equation of uniform motion.' }
        ]
      }
    ]
  },

  // =========================================================================
  // 6. SOCIAL STUDIES
  // =========================================================================
  'Social Studies': {
    name: 'Social Studies',
    description: 'Explore history, world geography, democratic governance, civic institutions, and economic systems.',
    topics: [
      {
        id: 'soc_history',
        name: 'History & Democratic Governance',
        description: 'Constitutional frameworks, democratic ideals, separation of powers, and civic rights.',
        difficulty: 'Medium',
        duration: 20,
        questions: [
          { q: 'What is the foundational principle of a democratic republic?', a: 'Rule of a hereditary monarch', b: 'Sovereignty of the people through elected representatives', c: 'Military administration', d: 'Corporate executive decree', correct: 'B', hint: 'Government of the people, by the people, for the people.' },
          { q: 'Which organ of government is responsible for interpreting laws?', a: 'Legislature', b: 'Judiciary', c: 'Executive', d: 'Electoral Commission', correct: 'B', hint: 'The court system resolves disputes and interprets the constitution.' },
          { q: 'What document is universally recognized as the supreme law of a constitutional nation?', a: 'Statutory Act', b: 'Constitution', c: 'Executive Order', d: 'Civil Code', correct: 'B', hint: 'Defines fundamental legal rights and institutional structure.' }
        ]
      }
    ]
  }
};

/**
 * Helper to get topics for a specific subject.
 * Falls back gracefully to Mathematics if subject not found.
 */
export function getTopicsForSubject(subjectName) {
  const norm = (subjectName || 'Mathematics').trim();
  const sub = SUBJECT_CURRICULUM[norm] || SUBJECT_CURRICULUM['Mathematics'];
  return sub.topics;
}

/**
 * Helper to get a specific topic with its 20 questions.
 */
export function getTopicById(topicId, subjectName) {
  const topics = getTopicsForSubject(subjectName);
  return topics.find(t => t.id === topicId) || topics[0];
}
