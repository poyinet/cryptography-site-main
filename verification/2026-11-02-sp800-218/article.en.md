# Secure Software Development Framework (SSDF) Version 1.1 (SP 800-218)

## principle

**Standard**: Secure Software Development Framework (SSDF) Version 1.1 Recommendations for Mitigating the Risk of Software Vulnerabilities (安全软件开发框架（SP 800-218）). The abstract names the object: "This document recommends the Secure Software Development Framework (SSDF)" and gives its make-up: "a core set of high-level secure software development practices that can be integrated into each SDLC implementation". The title block reads "Secure Software Development Framework (SSDF) Version 1.1" and "Recommendations for Mitigating the Risk of Software Vulnerabilities", and §2 states the structure: "The practices are organized into four groups".Read together the three give the character: a high-level practice set to be folded into any life cycle model, introducing neither new practices nor new terminology, whose main output is the four-group structure.

## why

The gap is the abstract’s first sentence: "Few software development life cycle (SDLC) models explicitly address software security in detail, so secure software development practices usually need to be added to each SDLC model to ensure that the software being developed is well-secured." Section 1 carries the same judgement into practice: "secure software development practices should be integrated throughout it for three reasons: to reduce the number of vulnerabilities in released software". The abstract also gives the acquirer’s reason: "Because the framework provides a common vocabulary for secure software development, software acquirers can also use it to foster communications with suppliers in acquisition processes and other management activities."The quotations put the problem at both ends: on the producer’s side the gap is that security practice is not written into the models, on the acquirer’s side it is the missing common vocabulary, and the framework addresses both.

## used

The obligations are should-level and their subject is the organisation. The executive summary states the general duty: "Organizations should integrate the SSDF throughout their existing software development practices, express their secure software development requirements to third-party suppliers using SSDF conventions, and acquire software that meets the practices described in the SSDF." Each of the four groups in §2 is addressed to organisations, one of them being "2. Protect the Software (PS): Organizations should protect all components of their software from tampering and unauthorized access." Section 1 puts the cloud allocation on the tenant: "The tenant organization should establish an agreement with the providers that specifies which party is responsible for each practice and task and how each provider will attest to their conformance with the agreement."All three are addressed to organisations or tenants and all are should-level: the framework offers recommendations, not mandatory clauses, and the allocation of responsibility has to be written into an agreement stating who performs each practice and who attests to it.

## broken

Section 1 states two things it does not do. It gives no implementation method: "This document identifies secure software development practices but does not prescribe how to implement them." and it invents neither practices nor terms: "This document does not introduce new practices or define new terminology." The same section bounds how the framework is used: "The intention of the SSDF is not to create a checklist to follow, but to provide a basis for planning and implementing a risk-based approach to adopting secure software development practices." Even the relation to the Cybersecurity Framework is limited — the note says "the SSDF practices do not map to them".

## history

The title block opens "NIST Special Publication 800-218"; the three authors are Souppaya, Scarfone and Dodson, the last marked "Former NIST employee; all work for this publication was done while at NIST." The date line is February 2022, the citation reads "Natl. Inst. Stand. Technol. Spec. Publ. 800-218, 36 pages (February 2022) CODEN: NSPUE2" and the free-access line is followed by the DOI 10.6028/NIST.SP.800-218. The audience block defines the readership: "There are two primary audiences for this document. The first is software producers". The acknowledgements list the colleagues: "The authors thank all of their NIST colleagues for their support throughout the SSDF update". The note to readers bounds the currency of the text: "The publication will be updated periodically to reflect your inputs and feedback."

## refs

- Wikipedia search entry for 安全软件开发框架（SP 800-218）. https://zh.wikipedia.org/w/index.php?search=%E5%AE%89%E5%85%A8%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E6%A1%86%E6%9E%B6%EF%BC%88SP%20800-218%EF%BC%89
- Handbook of Applied Cryptography (Menezes, van Oorschot, Vanstone). https://www.cacr.math.uwaterloo.ca/hac/

## example

**Formal model and reproduction steps**

\[S=\min_i S_i,\quad S_i\in\{\text{密钥强度},\text{分组安全},\text{实现安全}\}\]

Secure Software Development Framework (SSDF) Version 1.1 Recommendations for Mitigating the Risk of Software Vulnerabilities: the registered public parameters, key material or randomness, and message are mapped through the stated transformation to an output checked against the registered criterion. The worked example is a structural reproduction, not a new test vector; parameter ranges, standard versions and implementation details remain source-bound.
