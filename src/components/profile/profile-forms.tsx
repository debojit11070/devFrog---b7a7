"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/form-controls";
import { FormField, fieldAria } from "@/components/shared/form-field";
import { useUpdateProfile } from "@/hooks/api/admin-profile";
import type { CandidateProfile, CompanyProfile, User } from "@/lib/api/types";
import { optionalUrlValue, parseSkills, accountSchema, candidateProfileSchema, companyProfileSchema, type AccountFormValues, type CandidateProfileFormValues, type CompanyProfileFormValues } from "@/lib/validations/profile";

/** Shared account details (name, bio, avatar) for every role. */
export function AccountForm({ user }: { user: User }) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { fullName: user.fullName, bio: user.bio ?? "", avatarUrl: user.avatarUrl ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        kind: "account",
        body: { fullName: values.fullName, bio: values.bio || null, avatarUrl: optionalUrlValue(values.avatarUrl) },
      });
    } catch {
      return; // the global mutation handler has already shown the error
    }
    toast.success("Account details saved");
    reset(values);
    router.refresh();
  }, () => undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>How your name and details appear across DevForge. Your email is {user.email}.</CardDescription>
      </CardHeader>
      <form onSubmit={(event) => void onSubmit(event)} noValidate>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="fullName" label="Full name" error={errors.fullName}>
            <Input autoComplete="name" {...fieldAria("fullName", errors.fullName)} {...register("fullName")} />
          </FormField>
          <FormField id="avatarUrl" label="Avatar URL" error={errors.avatarUrl} hint="Optional. Link to a square image.">
            <Input type="url" placeholder="https://" {...fieldAria("avatarUrl", errors.avatarUrl, true)} {...register("avatarUrl")} />
          </FormField>
          <FormField id="bio" label="Bio" error={errors.bio} className="sm:col-span-2">
            <Textarea rows={3} {...fieldAria("bio", errors.bio)} {...register("bio")} />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!isDirty} loading={updateProfile.isPending}>Save account</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function CandidateProfileForm({ profile }: { profile: CandidateProfile | null | undefined }) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CandidateProfileFormValues>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: {
      headline: profile?.headline ?? "",
      skills: (profile?.skills ?? []).join(", "),
      githubUrl: profile?.githubUrl ?? "",
      linkedinUrl: profile?.linkedinUrl ?? "",
      portfolioUrl: profile?.portfolioUrl ?? "",
      resumeUrl: profile?.resumeUrl ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        kind: "candidate",
        body: {
          headline: values.headline || null,
          skills: parseSkills(values.skills),
          githubUrl: optionalUrlValue(values.githubUrl),
          linkedinUrl: optionalUrlValue(values.linkedinUrl),
          portfolioUrl: optionalUrlValue(values.portfolioUrl),
          resumeUrl: optionalUrlValue(values.resumeUrl),
        },
      });
    } catch {
      return;
    }
    toast.success("Candidate profile saved");
    reset(values);
    router.refresh();
  }, () => undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate profile</CardTitle>
        <CardDescription>Companies see this when they review your attempts.</CardDescription>
      </CardHeader>
      <form onSubmit={(event) => void onSubmit(event)} noValidate>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="headline" label="Headline" error={errors.headline} className="sm:col-span-2">
            <Input placeholder="e.g. Full-stack engineer, TypeScript and Node" {...fieldAria("headline", errors.headline)} {...register("headline")} />
          </FormField>
          <FormField id="skills" label="Skills" error={errors.skills} hint="Separate with commas" className="sm:col-span-2">
            <Input placeholder="TypeScript, Node.js, PostgreSQL" {...fieldAria("skills", errors.skills, true)} {...register("skills")} />
          </FormField>
          <FormField id="githubUrl" label="GitHub" error={errors.githubUrl}>
            <Input type="url" placeholder="https://github.com/you" {...fieldAria("githubUrl", errors.githubUrl)} {...register("githubUrl")} />
          </FormField>
          <FormField id="linkedinUrl" label="LinkedIn" error={errors.linkedinUrl}>
            <Input type="url" placeholder="https://linkedin.com/in/you" {...fieldAria("linkedinUrl", errors.linkedinUrl)} {...register("linkedinUrl")} />
          </FormField>
          <FormField id="portfolioUrl" label="Portfolio" error={errors.portfolioUrl}>
            <Input type="url" placeholder="https://" {...fieldAria("portfolioUrl", errors.portfolioUrl)} {...register("portfolioUrl")} />
          </FormField>
          <FormField id="resumeUrl" label="Resume link" error={errors.resumeUrl}>
            <Input type="url" placeholder="https://" {...fieldAria("resumeUrl", errors.resumeUrl)} {...register("resumeUrl")} />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!isDirty} loading={updateProfile.isPending}>Save profile</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export function CompanyProfileForm({ profile }: { profile: CompanyProfile | null | undefined }) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CompanyProfileFormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      companyName: profile?.companyName ?? "",
      website: profile?.website ?? "",
      logoUrl: profile?.logoUrl ?? "",
      industry: profile?.industry ?? "",
      size: profile?.size ?? "",
      about: profile?.about ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync({
        kind: "company",
        body: {
          companyName: values.companyName,
          website: optionalUrlValue(values.website),
          logoUrl: optionalUrlValue(values.logoUrl),
          industry: values.industry || null,
          size: values.size || null,
          about: values.about || null,
        },
      });
    } catch {
      return;
    }
    toast.success("Company profile saved");
    reset(values);
    router.refresh();
  }, () => undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company profile</CardTitle>
        <CardDescription>Shown to candidates on the assessments you publish.</CardDescription>
      </CardHeader>
      <form onSubmit={(event) => void onSubmit(event)} noValidate>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField id="companyName" label="Company name" error={errors.companyName}>
            <Input {...fieldAria("companyName", errors.companyName)} {...register("companyName")} />
          </FormField>
          <FormField id="website" label="Website" error={errors.website}>
            <Input type="url" placeholder="https://" {...fieldAria("website", errors.website)} {...register("website")} />
          </FormField>
          <FormField id="industry" label="Industry" error={errors.industry}>
            <Input placeholder="Software, Fintech…" {...fieldAria("industry", errors.industry)} {...register("industry")} />
          </FormField>
          <FormField id="size" label="Company size" error={errors.size}>
            <Input placeholder="50–200" {...fieldAria("size", errors.size)} {...register("size")} />
          </FormField>
          <FormField id="logoUrl" label="Logo URL" error={errors.logoUrl} className="sm:col-span-2">
            <Input type="url" placeholder="https://" {...fieldAria("logoUrl", errors.logoUrl)} {...register("logoUrl")} />
          </FormField>
          <FormField id="about" label="About" error={errors.about} className="sm:col-span-2">
            <Textarea rows={4} {...fieldAria("about", errors.about)} {...register("about")} />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={!isDirty} loading={updateProfile.isPending}>Save company</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
