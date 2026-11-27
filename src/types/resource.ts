export type ResourceKind = 'pdf' | 'code' | 'projectPage' | 'huggingFace' | 'demo' | 'details';

export interface ProjectResource {
    kind: ResourceKind;
    href: string;
}
